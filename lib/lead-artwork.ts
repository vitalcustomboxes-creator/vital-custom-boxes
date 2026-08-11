import 'server-only';

import { randomUUID } from 'node:crypto';

import { LEAD_ARTWORK_PREFIX, uploadLeadArtwork } from '@/lib/r2';

/**
 * Server-side handling of the quote form's artwork upload.
 *
 * The form caps files at 5 × 10 MB, but a server action accepts whatever is
 * posted to it — the browser is not a validator. Everything here is re-checked
 * against the same limits before a single byte reaches R2.
 */

export const MAX_ARTWORK_FILES = 5;
export const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

/**
 * Keyed by extension rather than MIME type: browsers report `.ai` and `.eps`
 * inconsistently (`application/postscript`, `application/illustrator`, or
 * `application/octet-stream` depending on the OS), so the filename is the more
 * reliable signal. The stored content type is normalised from this map.
 */
const ALLOWED_EXTENSIONS = new Map([
  ['pdf', 'application/pdf'],
  ['ai', 'application/illustrator'],
  ['eps', 'application/postscript'],
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
]);

/** What gets stored on the submission — a reference, never the bytes. */
export interface ArtworkRef {
  key: string;
  name: string;
  size: number;
  type: string;
}

export class ArtworkError extends Error {}

function extensionOf(filename: string) {
  const extension = filename.toLowerCase().split('.').pop() ?? '';
  return ALLOWED_EXTENSIONS.has(extension) ? extension : null;
}

/** Keeps the original name readable in the admin inbox without trusting it. */
function safeName(filename: string) {
  return filename.replace(/[/\\]/g, '-').replace(/[^\w.\- ]/g, '').trim().slice(0, 120) || 'artwork';
}

/**
 * Upload every attached file and return the references to store on the lead.
 * Throws `ArtworkError` for anything a customer could reasonably have caused,
 * so the action can answer with a message rather than a generic failure.
 */
export async function uploadQuoteArtwork(files: File[]): Promise<ArtworkRef[]> {
  if (!files.length) return [];
  if (files.length > MAX_ARTWORK_FILES) {
    throw new ArtworkError(`Attach up to ${MAX_ARTWORK_FILES} artwork files.`);
  }

  const batch = randomUUID();
  const uploaded: ArtworkRef[] = [];
  for (const file of files) {
    const extension = extensionOf(file.name);
    if (!extension) {
      throw new ArtworkError(`"${safeName(file.name)}" is not a supported file type. Use PDF, AI, EPS, PNG or JPG.`);
    }
    if (file.size > MAX_ARTWORK_BYTES) {
      throw new ArtworkError(`"${safeName(file.name)}" is larger than 10 MB.`);
    }

    const contentType = ALLOWED_EXTENSIONS.get(extension) ?? 'application/octet-stream';
    const key = `${LEAD_ARTWORK_PREFIX}${batch}/${randomUUID()}.${extension}`;
    await uploadLeadArtwork(key, new Uint8Array(await file.arrayBuffer()), contentType);
    uploaded.push({ key, name: safeName(file.name), size: file.size, type: contentType });
  }
  return uploaded;
}
