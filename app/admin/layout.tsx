import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin | Vital Custom Boxes',
  description: null,
  alternates: { canonical: null },
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
