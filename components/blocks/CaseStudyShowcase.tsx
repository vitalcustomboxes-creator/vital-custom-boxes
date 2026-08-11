/**
 * components/blocks/CaseStudyShowcase.tsx — shared case-study body (owner: BE-2).
 *
 * Rendered by BOTH /portfolio/ and /case-studies/ (same content by design —
 * /case-studies/ canonicalizes to /portfolio/, see docs/seo/TECH_SEO.md §2.5).
 * There is no per-study detail route, so each study renders as a full
 * alternating section. Cards follow the card-lift/equal-height audit rules
 * where applicable; images are live-site URLs per the brief.
 *
 * Honesty rule (audit "no fabricated testimonials"): casestudies.json entries
 * are copy-status "derived" with a client-verification TODO — a single visible
 * note discloses that, mirroring the ReviewWall placeholder note (§6.13).
 */
import Image from "next/image";
import { Check } from "lucide-react";
import type { CaseStudy } from "@/lib/types";

export function CaseStudyShowcase({ studies }: { studies: CaseStudy[] }) {
  return (
    <>
      <section className="section-compact bg-paper-50">
        <div className="container-hm">
          <p className="max-w-[65ch] text-sm text-slate-600">
            Project summaries below are representative of real order types and are
            pending final client verification before launch.
            {/* TODO client: verify project details and approve copy (see content/casestudies.json `todo`). */}
          </p>
        </div>
      </section>

      {studies.map((study, i) => (
        <section
          key={study.slug}
          id={study.slug}
          className={`section ${i % 2 === 0 ? "bg-kraft-100" : "bg-paper-50"}`}
        >
          <div className="container-hm grid items-center gap-10 lg:grid-cols-2">
            <div className={i % 2 === 0 ? "" : "lg:order-2"}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-100 bg-white">
                <Image
                  src={study.imageUrl}
                  alt={study.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="eyebrow">{study.industry}</span>
              <h2 className="max-w-[26ch]">{study.title}</h2>
              <p className="max-w-[65ch] text-slate-600">{study.summary}</p>
              <div>
                <h3 className="h4">The challenge</h3>
                <p className="mt-2 max-w-[65ch] text-slate-600">{study.challenge}</p>
              </div>
              <div>
                <h3 className="h4">What we did</h3>
                <p className="mt-2 max-w-[65ch] text-slate-600">{study.solution}</p>
              </div>
              <ul className="mt-1 flex flex-col gap-2">
                {study.results.map((result) => (
                  <li key={result} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={16} className="mt-0.5 shrink-0 text-terra-600" aria-hidden="true" />
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
