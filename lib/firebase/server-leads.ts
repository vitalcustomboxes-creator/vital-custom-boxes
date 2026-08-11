import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore } from '@/lib/firebase/admin';

export type SubmissionKind = 'contact' | 'quote' | 'sample';

export const SUBMISSION_COLLECTIONS: Record<SubmissionKind, string> = {
  contact: 'contactSubmissions',
  quote: 'quoteRequests',
  sample: 'sampleRequests',
};

/** Firestore rejects `undefined`; forms leave optional fields unset. */
function defined(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

/**
 * Store a form submission.
 *
 * Writes as the service account through firebase-admin. This deliberately does
 * NOT sign in as the admin user: doing so needed the account password in an env
 * var, cost an Identity Toolkit round trip on every submission, and broke lead
 * capture outright whenever that password was rotated — the write failed and
 * the visitor saw a generic error.
 *
 * Because the service account bypasses security rules, the `create: if
 * isAdmin()` rule on these collections no longer has to be satisfied by
 * impersonating a person.
 */
export async function saveSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
): Promise<void> {
  const collection = SUBMISSION_COLLECTIONS[kind];
  try {
    await getAdminFirestore().collection(collection).add({
      ...defined(payload),
      submissionType: kind,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // The action above turns this into a generic message for the visitor, so
    // the real reason has to be legible here or the failure is undiagnosable.
    console.error(`[lead] Firestore write to "${collection}" failed:`, error);
    throw error;
  }
}
