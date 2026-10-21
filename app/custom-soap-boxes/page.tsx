import type { Metadata } from "next";
import { PackagingLandingPage } from "@/components/blocks/PackagingLandingPage";
import { PACKAGING_LANDINGS } from "@/lib/packaging-landings";
import { buildMetadata, buildPageTitle } from "@/lib/seo";

export const revalidate = 86400;

const page = PACKAGING_LANDINGS["custom-soap-boxes"];
export const metadata: Metadata = buildMetadata({
  title: page.seoTitle ?? buildPageTitle(page.title),
  description: page.description,
  path: `/${page.slug}/`,
});
export default function Page() {
  return <PackagingLandingPage page={page} />;
}
