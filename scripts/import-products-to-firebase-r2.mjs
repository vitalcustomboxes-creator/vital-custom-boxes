#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const productsPath = join(root, 'content', 'products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf8'));

const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const concurrency = 8;
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const contentTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

function resolvePublicImage(url) {
  if (typeof url !== 'string' || !url.startsWith('/')) throw new Error(`Unsupported image reference: ${url}`);
  const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
  const file = normalize(join(publicDir, ...pathname.slice(1).split('/')));
  if (file !== publicDir && !file.startsWith(`${publicDir}${sep}`)) throw new Error(`Image escapes public/: ${url}`);
  if (!existsSync(file)) throw new Error(`Missing image: ${url}`);
  const extension = extname(file).toLowerCase();
  if (!allowedExtensions.has(extension)) throw new Error(`Unsupported image type: ${url}`);
  return { file, extension };
}

function safeName(file, extension) {
  return basename(file, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
}

function encodeKey(key) {
  return key.split('/').map(encodeURIComponent).join('/');
}

function publicImageUrl(key) {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  return publicBase ? `${publicBase}/${key}` : `/api/product-images/${encodeKey(key)}`;
}

function imageRecord(product, url, slot) {
  const { file, extension } = resolvePublicImage(url);
  const bytes = readFileSync(file);
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  const key = `products/${product.slug}/import-${slot}-${hash}-${safeName(file, extension)}${extension === '.jpeg' ? '.jpg' : extension}`;
  return {
    sourceUrl: url,
    file,
    bytes,
    size: bytes.byteLength,
    contentType: contentTypes[extension],
    key,
    imageUrl: publicImageUrl(key),
  };
}

const prepared = products.map((product) => {
  const primary = imageRecord(product, product.imageUrl, 'primary');
  const gallery = (product.images ?? []).map((image, index) => ({
    ...imageRecord(product, image.src, `gallery-${index + 1}`),
    alt: image.alt,
  }));
  const migratedProduct = { ...product, imageUrl: primary.imageUrl };
  if (product.images) migratedProduct.images = gallery.map(({ imageUrl, alt }) => ({ src: imageUrl, alt }));
  return { product: migratedProduct, assets: [primary, ...gallery] };
});

const assets = prepared.flatMap((item) => item.assets);
const totalBytes = assets.reduce((total, asset) => total + asset.size, 0);

console.log(`Products:         ${prepared.length}`);
console.log(`Image objects:    ${assets.length}`);
console.log(`Upload size:      ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`Mode:             ${apply ? 'APPLY' : 'DRY RUN'}`);
console.log(`Image URL format: ${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ? 'R2 custom domain' : 'same-origin /api/product-images/ proxy'}`);

if (!apply) {
  console.log('\nValidation passed. Run `npm run catalog:import -- --apply` to upload images and write Firestore products.');
  process.exit(0);
}

const r2Config = {
  endpoint: required('R2_ENDPOINT'),
  bucket: required('R2_BUCKET_NAME'),
  accessKeyId: required('R2_ACCESS_KEY_ID'),
  secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
};
const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID'),
};
const adminEmail = required('NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL');
const adminPassword = required('FIREBASE_ADMIN_PASSWORD');

const [{ S3Client, HeadObjectCommand, PutObjectCommand }, firebaseApp, firebaseAuth, firestoreApi] = await Promise.all([
  import('@aws-sdk/client-s3'),
  import('firebase/app'),
  import('firebase/auth'),
  import('firebase/firestore'),
]);

const r2 = new S3Client({
  region: 'auto',
  endpoint: r2Config.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: r2Config.accessKeyId, secretAccessKey: r2Config.secretAccessKey },
});

const app = firebaseApp.initializeApp(firebaseConfig, `catalog-import-${Date.now()}`);
const auth = firebaseAuth.getAuth(app);
await firebaseAuth.signInWithEmailAndPassword(auth, adminEmail, adminPassword);

let completed = 0;
let uploaded = 0;
let skipped = 0;

async function uploadAsset(asset) {
  let exists = false;
  if (!force) {
    try {
      const existing = await r2.send(new HeadObjectCommand({ Bucket: r2Config.bucket, Key: asset.key }));
      exists = existing.ContentLength === asset.size && existing.ContentType === asset.contentType;
    } catch (error) {
      const status = error?.$metadata?.httpStatusCode;
      if (status !== 404) throw error;
    }
  }

  if (exists) skipped += 1;
  else {
    await r2.send(new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: asset.key,
      Body: asset.bytes,
      ContentType: asset.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    uploaded += 1;
  }
  completed += 1;
  if (completed % 50 === 0 || completed === assets.length) {
    console.log(`Images: ${completed}/${assets.length} (${uploaded} uploaded, ${skipped} unchanged)`);
  }
}

let cursor = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (cursor < assets.length) {
    const asset = assets[cursor];
    cursor += 1;
    await uploadAsset(asset);
  }
}));

const database = firestoreApi.getFirestore(app);
for (let start = 0; start < prepared.length; start += 450) {
  const batch = firestoreApi.writeBatch(database);
  prepared.slice(start, start + 450).forEach(({ product }) => {
    batch.set(firestoreApi.doc(database, 'products', product.slug), product);
  });
  await batch.commit();
  console.log(`Firestore: ${Math.min(start + 450, prepared.length)}/${prepared.length} products written`);
}

await firebaseAuth.signOut(auth);
await firebaseApp.deleteApp(app);
console.log('\nCatalog import complete.');
