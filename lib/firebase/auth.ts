'use client';

import {
  browserLocalPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { firebaseAuth } from '@/lib/firebase/client';

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL ?? 'admin@vitalcustomboxes.com';

function isAdmin(user: User | null): user is User {
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function observeAdminAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, async (user) => {
    if (user && !isAdmin(user)) {
      await signOut(firebaseAuth);
      callback(null);
      return;
    }
    callback(user);
  });
}

export async function signInAdmin(email: string, password: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('auth/invalid-credential');
  }
  await setPersistence(firebaseAuth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  if (!isAdmin(credential.user)) {
    await signOut(firebaseAuth);
    throw new Error('auth/unauthorized-admin');
  }
  return credential.user;
}

export async function sendAdminPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await fetch('/api/admin/password-reset/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail }),
  });
  if (response.status === 404) {
    throw new Error('auth/user-not-found');
  }
  if (response.status === 429) throw new Error('auth/too-many-requests');
  if (!response.ok) throw new Error('auth/password-reset-check-failed');
  await sendPasswordResetEmail(firebaseAuth, normalizedEmail);
}

export function signOutAdmin() {
  return signOut(firebaseAuth);
}
