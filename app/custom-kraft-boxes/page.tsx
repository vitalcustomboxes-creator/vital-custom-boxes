import type { Metadata } from 'next';
import { PackagingLandingPage } from '@/components/blocks/PackagingLandingPage';
import { PACKAGING_LANDINGS } from '@/lib/packaging-landings';
import { buildMetadata } from '@/lib/seo';

const page = PACKAGING_LANDINGS['custom-kraft-boxes'];

export const metadata: Metadata = buildMetadata({
  title: `${page.title} | Vital Custom Boxes`,
  description: page.description,
  path: `/${page.slug}/`,
});

export default function Page() {
  return <PackagingLandingPage page={page} />;
}
