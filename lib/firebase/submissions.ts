'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';

export type SubmissionTab = 'contact' | 'quote' | 'sample';
export interface AdminSubmission {
  id: string;
  createdAt: Date | null;
  data: Record<string, unknown>;
}

export const SUBMISSION_COLLECTIONS: Record<SubmissionTab, string> = {
  contact: 'contactSubmissions',
  quote: 'quoteRequests',
  sample: 'sampleRequests',
};

function mapSubmission(id: string, data: DocumentData): AdminSubmission {
  const createdAt = data.createdAt?.toDate instanceof Function ? data.createdAt.toDate() : null;
  return { id, createdAt, data: { ...data, createdAt: undefined } };
}

export const SUBMISSIONS_PAGE_SIZE = 25;

export interface SubmissionPage {
  items: AdminSubmission[];
  /** Pass back to fetch the next page. `null` once the collection is exhausted. */
  cursor: QueryDocumentSnapshot | null;
}

/**
 * One page of submissions, newest first.
 *
 * This used to be an unbounded `onSnapshot` over the whole collection, which
 * meant every inbox visit — and every tab switch — cost one Firestore read per
 * submission ever received, growing without limit as leads came in. Reads are
 * now capped at the page size, at the cost of losing live updates: the inbox
 * refreshes on demand instead.
 */
export async function fetchSubmissions(
  tab: SubmissionTab,
  cursor?: QueryDocumentSnapshot | null,
): Promise<SubmissionPage> {
  const snapshot = await getDocs(query(
    collection(firestore, SUBMISSION_COLLECTIONS[tab]),
    orderBy('createdAt', 'desc'),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(SUBMISSIONS_PAGE_SIZE),
  ));
  return {
    items: snapshot.docs.map((item) => mapSubmission(item.id, item.data())),
    // A short page is the last page; a full one may or may not be, so keep the
    // cursor and let the next fetch come back empty.
    cursor: snapshot.docs.length === SUBMISSIONS_PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

export function deleteSubmission(tab: SubmissionTab, id: string) {
  return deleteDoc(doc(firestore, SUBMISSION_COLLECTIONS[tab], id));
}

export function updateSubmissionStatus(tab: SubmissionTab, id: string, status: string) {
  return updateDoc(doc(firestore, SUBMISSION_COLLECTIONS[tab], id), { status });
}
