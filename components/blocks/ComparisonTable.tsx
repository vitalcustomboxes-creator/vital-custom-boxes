/**
 * ComparisonTable — Server Component (FE-3 blocks). Materials/stocks
 * comparison matrix (/materials, /box-styles). Same chrome as SpecTable;
 * horizontal scroll wrapper keeps mobile usable. Boolean cells render
 * check/minus icons with sr-only text so the data survives screen readers.
 */
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComparisonRow {
  label: string;
  /** One value per column — string or boolean (yes/no). */
  values: Array<string | boolean>;
}

export interface ComparisonTableProps {
  /** Table caption (sr-only) — e.g. "Packaging material comparison". */
  caption: string;
  /** Column headers — e.g. ['Kraft', 'Corrugated', 'Rigid', 'Cardstock']. */
  columns: string[];
  rows: ComparisonRow[];
  className?: string;
}

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'string') return <>{value}</>;
  return value ? (
    <>
      <Check size={18} className="inline-block text-success" aria-hidden="true" />
      <span className="sr-only">Yes</span>
    </>
  ) : (
    <>
      <Minus size={18} className="inline-block text-slate-400" aria-hidden="true" />
      <span className="sr-only">No</span>
    </>
  );
}

export function ComparisonTable({
  caption,
  columns,
  rows,
  className,
}: ComparisonTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-ink-100', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ink-100">
              <td className="bg-kraft-100 px-4 py-3.5" aria-hidden="true" />
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="bg-kraft-100 px-4 py-3.5 text-left font-display font-semibold text-ink-900"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-ink-100 last:border-0">
                <th
                  scope="row"
                  className="w-2/5 bg-kraft-100 px-4 py-3.5 text-left align-top font-semibold text-ink-700 md:w-[220px]"
                >
                  {row.label}
                </th>
                {columns.map((col, i) => (
                  <td key={col} className="bg-white px-4 py-3.5 text-slate-600">
                    <Cell value={row.values[i] ?? '—'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComparisonTable;
