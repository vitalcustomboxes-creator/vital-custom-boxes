/**
 * SpecTable — Server Component (FE-3). DESIGN_SPEC §6.11.
 *
 * Two-column spec table (th rail on kraft-100, values on white). MOQ /
 * Turnaround / Shipping rows are ALWAYS appended from the `globals` prop —
 * the audit's single-source rule. Pages pass page-specific rows (Material,
 * Style, Sizes, Printing, Finishes, …) or rely on the generic defaults below
 * (kept aligned with the quote-form options — no turnaround/MOQ claims).
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Globals } from '@/lib/types';

export interface SpecRow {
  label: string;
  value: ReactNode;
}

export interface SpecTableProps {
  /** Page-specific rows; defaults cover stocks/sizes/printing/finishes. */
  rows?: SpecRow[];
  /**
   * From getGlobals() — appends MOQ / Turnaround / Shipping rows. Omit ONLY
   * when the page already includes those rows itself (values must still come
   * from getGlobals() — audit: single source).
   */
  globals?: Pick<Globals, 'moq' | 'sla' | 'shipping'>;
  /** Screen-reader table caption. */
  caption?: string;
  className?: string;
}

const DEFAULT_ROWS: SpecRow[] = [
  {
    label: 'Stocks',
    value: '12pt–24pt cardstock, kraft, corrugated, rigid, eco (recycled kraft)',
  },
  { label: 'Sizes', value: 'Fully custom — made to your exact L × W × D' },
  {
    label: 'Printing',
    value: 'Offset & digital — 1–4 colors (full CMYK) or unprinted, inside and/or outside',
  },
  {
    label: 'Finishes',
    value:
      'Glossy, matte or soft-touch lamination; embossing, debossing, foiling, PVC window, UV coating',
  },
];

export function SpecTable({
  rows = DEFAULT_ROWS,
  globals,
  caption = 'Packaging specifications',
  className,
}: SpecTableProps) {
  const allRows: SpecRow[] = [
    ...rows,
    // Single source of truth (content/globals.json) — never restated locally.
    ...(globals
      ? [
          { label: 'Minimum order', value: globals.moq },
          { label: 'Turnaround', value: globals.sla },
          { label: 'Shipping', value: globals.shipping },
        ]
      : []),
  ];

  return (
    <div className={cn('overflow-hidden rounded-lg border border-ink-100', className)}>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {allRows.map((row) => (
            <tr key={row.label} className="border-b border-ink-100 last:border-0">
              <th
                scope="row"
                className="w-2/5 bg-kraft-100 px-4 py-3.5 text-left align-top font-semibold text-ink-700 md:w-[260px]"
              >
                {row.label}
              </th>
              <td className="bg-white px-4 py-3.5 text-slate-600">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SpecTable;
