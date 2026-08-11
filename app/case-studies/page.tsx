/**
 * /case-studies/ used to render the same content as /portfolio/ with a
 * cross-canonical. A permanent redirect is clearer for users and search
 * engines: only one live page can now own the title, content, and canonical.
 */
import { permanentRedirect } from "next/navigation";

export default function CaseStudiesRedirectPage() {
  permanentRedirect("/portfolio/");
}
