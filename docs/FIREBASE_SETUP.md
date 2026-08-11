# Firebase setup

The admin catalog uses Firebase Authentication and Cloud Firestore. Product images are intentionally not uploaded to Firebase Storage; the image workflow will use Cloudflare R2.

## R2 product images

Newly selected primary and gallery images are uploaded to the configured R2 bucket before the Firestore product document is saved. Firestore stores only the resulting image URLs. Replaced or removed managed images are deleted from R2 after the Firestore update succeeds, and deleting a product also removes its managed images.

Uploads accept JPG, PNG, WEBP, and AVIF files up to 4 MB. The upload and delete endpoint verifies the current Firebase administrator ID token before accessing R2.

Until `NEXT_PUBLIC_R2_PUBLIC_URL` is configured, images are delivered through `/api/product-images/*`. For production, connect a custom domain to the R2 bucket and set that variable to its origin, such as `https://images.example.com`.

### Import the local product catalog

The catalog migration reads all products from `content/products.json`, uploads their local primary/gallery images to R2, substitutes the R2 URLs, and writes the resulting product documents to Firestore. It is a dry run by default:

```bash
npm run catalog:import
```

For a real import, add `FIREBASE_ADMIN_PASSWORD` to the ignored `.env.local` file and run:

```bash
npm run catalog:import -- --apply
```

R2 keys are deterministic, so rerunning the command skips unchanged objects. Use `--force` together with `--apply` only when every image should be uploaded again. The importer updates/creates the 285 local product documents but does not delete unrelated Firestore records or R2 objects.

## Console setup

1. In Firebase Authentication, enable the **Email/Password** provider.
2. Create the administrator account `admin@vitalcustomboxes.com` and assign it a strong password.
3. Create the Cloud Firestore database for the `vital-custom-boxes` project.
4. Deploy the repository rules and indexes:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

The first successful administrator session checks the `products` collection. If it is empty, the existing records from `content/products.json` are written to Firestore in one batch. Later sessions treat Firestore as the admin catalog source.

## Collections

- `products/{slug}` stores the same product fields used by `content/products.json`. The `categoryName` value is presentation-only and is not stored.
- `categories/{slug}` and `groups/{slug}` are reserved by the security rules for the finalized category/group schemas.

Public reads are allowed for catalog collections so the storefront can consume them later. Writes require the configured administrator email. Replace this email check with Firebase custom claims if more administrator accounts or roles are introduced.

## Environment variables

Copy `.env.example` to `.env.local` for a new environment and use the Firebase web-app values for that environment. Firebase web configuration identifies the project; access is enforced by Authentication and Firestore Security Rules.
