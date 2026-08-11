/**
 * GET /api/admin/lead-artwork/?key=… — stream one customer artwork file.
 *
 * Customer artwork is confidential, so unlike product imagery it is never
 * exposed through a public URL or the image proxy: this route is the only way
 * back out, and it requires an admin token. The key is checked against the
 * `leads/` prefix so a caller cannot walk the bucket with it.
 */
import { NextResponse } from 'next/server';

import { requireFirebaseAdmin } from '@/lib/firebase/admin';
import { deleteLeadArtwork, getLeadArtwork, isLeadArtworkKey } from '@/lib/r2';

export const runtime = 'nodejs';

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  const status = message === 'forbidden' ? 403 : message === 'unauthorized' ? 401 : 500;
  if (status === 500) console.error('[lead-artwork]', error);
  return NextResponse.json(
    { error: status === 500 ? fallback : 'Admin authentication is required.' },
    { status },
  );
}

export async function GET(request: Request) {
  try {
    await requireFirebaseAdmin(request);

    const key = new URL(request.url).searchParams.get('key') ?? '';
    if (!isLeadArtworkKey(key)) {
      return NextResponse.json({ error: 'That is not an artwork file.' }, { status: 400 });
    }

    const object = await getLeadArtwork(key);
    if (!object.Body) return NextResponse.json({ error: 'The file is no longer available.' }, { status: 404 });

    return new NextResponse(object.Body.transformToWebStream(), {
      headers: {
        'Content-Type': object.ContentType ?? 'application/octet-stream',
        'Content-Disposition': 'attachment',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return errorResponse(error, 'The file could not be downloaded.');
  }
}

/**
 * DELETE — drop the artwork belonging to a submission being deleted. Keys
 * outside the `leads/` prefix are ignored rather than honoured, so this can
 * never be turned into a bucket-wide delete.
 */
export async function DELETE(request: Request) {
  try {
    await requireFirebaseAdmin(request);
    const body = await request.json().catch(() => null) as { keys?: unknown } | null;
    const keys = Array.isArray(body?.keys)
      ? body.keys.filter((key): key is string => typeof key === 'string').slice(0, 100)
      : [];
    await deleteLeadArtwork(keys);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, 'The artwork could not be removed from R2.');
  }
}
