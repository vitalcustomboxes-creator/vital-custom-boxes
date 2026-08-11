import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function firebaseAdminCredential() {
  const value = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!value) return undefined;
  const trimmedValue = value.trim();
  const jsonValue = trimmedValue.startsWith("'") && trimmedValue.endsWith("'")
    ? trimmedValue.slice(1, -1)
    : trimmedValue;
  const serviceAccount = JSON.parse(jsonValue) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Firebase service account JSON is incomplete.');
  }
  return cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  });
}

const credential = (() => {
  try {
    return firebaseAdminCredential();
  } catch {
    return undefined;
  }
})();
const adminApp = getApps()[0] ?? initializeApp({
  projectId,
  ...(credential ? { credential } : {}),
});

/**
 * Firestore as the service account. Writes made through this bypass security
 * rules, which is the point: the server is trusted infrastructure, not a user.
 *
 * Server writes used to sign in as the admin account with a password held in
 * `FIREBASE_ADMIN_PASSWORD` purely to satisfy the `isAdmin()` rule. That made
 * every form submission depend on an env var staying in sync with a password
 * a human can reset — and when it drifted, lead capture failed silently.
 */
export function getAdminFirestore() {
  if (!credential) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured; the server cannot write to Firestore.');
  }
  return getFirestore(adminApp);
}

export async function firebaseUserExists(email: string) {
  try {
    await getAuth(adminApp).getUserByEmail(email);
    return true;
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';
    if (code === 'auth/user-not-found') return false;
    throw error;
  }
}

export async function requireFirebaseAdmin(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new Error('unauthorized');

  const decoded = await getAuth(adminApp).verifyIdToken(authorization.slice(7)).catch(() => {
    throw new Error('unauthorized');
  });
  const adminEmail = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL?.toLowerCase();
  if (!decoded.email || decoded.email.toLowerCase() !== adminEmail) throw new Error('forbidden');
  return decoded;
}
