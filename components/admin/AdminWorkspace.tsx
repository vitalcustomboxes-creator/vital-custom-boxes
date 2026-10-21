'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

function AdminLoading() {
  return <div role="status" className="grid min-h-[60vh] place-items-center p-6 text-sm text-slate-600">Loading secure admin workspace…</div>;
}

// The editor and Firebase SDK are private workspace features. Fetch them after
// hydration instead of including them in the route's initial JavaScript.
export const AdminWorkspace = dynamic<ComponentProps<typeof import('./AdminPortal').AdminPortal>>(
  () => import('./AdminPortal').then((module) => module.AdminPortal),
  { ssr: false, loading: AdminLoading },
);

export const ProductEditorWorkspace = dynamic<ComponentProps<typeof import('./ProductEditor').ProductEditor>>(
  () => import('./ProductEditor').then((module) => module.ProductEditor),
  { ssr: false, loading: AdminLoading },
);
