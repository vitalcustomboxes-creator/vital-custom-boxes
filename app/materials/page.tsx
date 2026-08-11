/**
 * /materials/ — packaging materials guide (owner: BE-2).
 * FE-3's <ComparisonTable> matrix + per-stock guide sections. Stock facts stay
 * aligned with content/faqs.json ("materials" answer) — no invented specs.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComparisonTable } from "@/components/blocks/ComparisonTable";
import { PageHero } from "@/components/blocks/PageHero";
import { CTABand } from "@/components/patterns/CTABand";
import { getGlobals } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, JsonLd, STATIC_PAGE_META } from "@/lib/seo";

const META = STATIC_PAGE_META["/materials"];

export const metadata: Metadata = buildMetadata({ ...META, path: "/materials/" });

const CRUMBS = [
  { name: "Home", href: "/" },
  { name: "Materials Guide", href: "/materials/" },
];

const COMPARISON_COLUMNS = ["Cardstock / SBS", "Kraft", "Corrugated", "Rigid board", "Mylar / films"];

const COMPARISON_ROWS = [
  {
    label: "Feel & structure",
    values: [
      "Smooth folding carton, 12pt–24pt",
      "Natural brown fiber, visible texture",
      "Fluted wall between liners",
      "Thick, non-folding wrapped chipboard",
      "Flexible high-barrier pouch",
    ],
  },
  {
    label: "Best for",
    values: [
      "Retail shelves & detailed artwork",
      "Earthy, eco-positioned brands",
      "Shipping strength & unboxing",
      "Luxury weight & gifting",
      "Freshness & aroma-sensitive goods",
    ],
  },
  {
    label: "Typical products",
    values: [
      "Cosmetics, bakery, retail cartons",
      "Candles, soaps, bags, takeout",
      "Mailers, shippers, pizza boxes",
      "Gift & magnetic-lid boxes",
      "Coffee, snacks, regulated goods",
    ],
  },
  {
    label: "Full-color printing",
    values: [true, true, true, true, true],
  },
  {
    label: "Curbside recyclable",
    values: [
      "Yes",
      "Yes",
      "Yes",
      "Usually — remove magnets/ribbon",
      "Check locally (specialty film)",
    ],
  },
];

const GUIDE = [
  {
    id: "cardstock",
    name: "Cardstock & SBS",
    body: "The default for retail packaging. Available from 12pt to 24pt, it folds cleanly, takes every finish we offer, and keeps fine type legible. Step up in caliper for heavier products or a more substantial feel in hand; choose SBS when color accuracy on a bright white base matters most. Food-safe material options are available on request for direct food contact.",
    link: { name: "See retail boxes", href: "/custom-retail-boxes/" },
  },
  {
    id: "kraft",
    name: "Kraft",
    body: "Unbleached, naturally textured, and recyclable. Kraft prints beautifully with darker, high-contrast artwork and suits brands that want the material itself to carry the eco message. It pairs well with minimal one- or two-color printing.",
    link: { name: "See printed bags", href: "/custom-printed-bags/" },
  },
  {
    id: "corrugated",
    name: "Corrugated",
    body: "A fluted layer sandwiched between liners gives corrugated its strength-to-weight advantage. It is the right call whenever the box travels — courier networks, food delivery, subscription mailers — and it can be printed inside and out for the unboxing moment.",
    link: { name: "See mailer boxes", href: "/custom-mailer-boxes/" },
  },
  {
    id: "rigid",
    name: "Rigid board",
    body: "Rigid boxes do not fold flat — they arrive assembled, with the heft customers read as luxury. Wrapped in printed paper and finished with foil, soft-touch lamination, or embossing, they are the standard for premium gifting and keepsake packaging.",
    link: { name: "See rigid boxes", href: "/custom-rigid-boxes/" },
  },
  {
    id: "barrier",
    name: "Specialty films & mylar",
    body: "High-barrier, resealable pouches protect aroma-sensitive and moisture-sensitive products. Options include clear windows and child-resistant zippers designed to help licensed brands meet state packaging requirements.",
    link: { name: "See mylar bags", href: "/mylar-bags/" },
  },
  {
    id: "eco",
    name: "Eco & recycled stocks",
    body: "Most of the stocks above are available with recycled content, and uncoated kraft is the easiest to recycle curbside. Tell us your sustainability targets in the quote and we will match the closest stock — see the sustainability page for what we do and do not claim.",
    link: { name: "Our sustainability approach", href: "/sustainability/" },
  },
];

const FINISHES = [
  "Matte or gloss lamination",
  "Soft-touch coating",
  "Spot UV",
  "Foil stamping",
  "Embossing & debossing",
  "Window cutouts",
];

export default function MaterialsPage() {
  const globals = getGlobals();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(CRUMBS.map((c) => ({ name: c.name, path: c.href })))}
      />
      <PageHero
        title={META.h1}
        lead="Cardstock, kraft, corrugated, rigid, and barrier films — what each stock is good at, and how to pick the right one for your product."
        crumbs={CRUMBS}
      />

      <section className="section bg-paper-50">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">At a glance</span>
            <h2>Compare the stocks</h2>
            <p className="lead max-w-[52ch] text-slate-600">
              Every stock below can be produced in your exact dimensions with
              full-color printing.
            </p>
          </div>
          <ComparisonTable
            caption="Packaging material comparison: structure, best uses, typical products, printing, and recyclability"
            columns={COMPARISON_COLUMNS}
            rows={COMPARISON_ROWS}
          />
        </div>
      </section>

      <section className="section bg-kraft-100">
        <div className="container-hm">
          <div className="mb-10 flex flex-col gap-3 md:mb-12">
            <span className="eyebrow">Stock guide</span>
            <h2>Know your stocks</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {GUIDE.map((stock) => (
              <article
                key={stock.id}
                id={stock.id}
                className="flex h-full flex-col gap-3 rounded-lg border border-ink-100 bg-white p-6 shadow-e1"
              >
                <h3 className="h4">{stock.name}</h3>
                <p className="text-sm text-slate-600">{stock.body}</p>
                <Link
                  href={stock.link.href}
                  className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-terra-600 transition-colors duration-150 ease-brand hover:text-terra-500"
                >
                  {stock.link.name}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper-50">
        <div className="container-hm grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Finishes</span>
            <h2 className="max-w-[22ch]">Then make it yours</h2>
            <p className="mt-3 max-w-[52ch] text-slate-600">
              Every stock takes a finishing layer — pick one statement finish
              rather than stacking them all. Unsure what survives shipping and
              shelf life? Ask in your quote and we’ll advise.
            </p>
          </div>
          <ul className="grid content-center gap-3 min-[480px]:grid-cols-2">
            {FINISHES.map((finish) => (
              <li
                key={finish}
                className="rounded-md border border-ink-100 bg-white px-4 py-3 text-sm font-semibold text-ink-700"
              >
                {finish}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        heading="Not sure which stock fits?"
        sub="Tell us what you're packing — we'll recommend the stock, caliper, and finish in your quote."
        phone={globals.phone}
        phoneHref={globals.phoneHref}
      />
    </>
  );
}
