import { NextResponse } from 'next/server';

import { firebaseUserExists } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

const NO_STORE = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254) {
      return NextResponse.json({ exists: false }, { status: 400, headers: NO_STORE });
    }

    const exists = await firebaseUserExists(email);
    return NextResponse.json({ exists }, { status: exists ? 200 : 404, headers: NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    // Treat credential/auth/initialization issues as transient 503
    const isTransient = message.includes('service account') 
      || message.includes('credential') 
      || message.includes('auth')
      || message.includes('unavailable')
      || message.includes('not initialized')
      || message.includes('Project ID')
      || message.includes('FIREBASE_');
    return NextResponse.json(
      { error: 'Firebase Authentication is temporarily unavailable.' },
      { status: isTransient ? 503 : 500, headers: NO_STORE },
    );
  }
}
