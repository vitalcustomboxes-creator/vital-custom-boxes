'use client';

/**
 * components/patterns/ProductSpecConfigurator.tsx — on-product-page spec picker
 * (adopted from the competitor UX). Quote-only model preserved: it does NOT
 * price or add to cart — it builds a deep link to /get-custom-quote/ with the
 * chosen specs as query params, which the quote page reads to pre-fill the
 * form. Option lists mirror QuoteForm exactly (keep in sync).
 */
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const BASE_STOCK = ['12pt Cardstock', '14pt Cardstock', '16pt Cardstock', '18pt Cardstock', '24pt Cardstock', 'Kraft', 'Corrugated', 'Rigid', 'Eco (recycled kraft)'];
const COLORS = ['1 color', '2 colors', '3 colors', '4 colors (full color CMYK)', 'No printing'];
const SURFACE = ['Outside only', 'Inside only', 'Outside + inside'];
const LAMINATION = ['None', 'Glossy', 'Matte', 'Soft Touch'];
const BASE_FINISHES = ['Embossing', 'Debossing', 'Foiling', 'PVC Window', 'UV Coating'];
const ARTWORK = ['Need design help', 'Artwork ready', 'Need dieline/template', 'Have reference images'];
const DEADLINES = [
  'Standard delivery — 18–22 business days',
  'Rush delivery — 12–14 business days',
];

const CATEGORY_PRESETS: Record<
  string,
  {
    stock?: string[];
    finishes?: string[];
    detailLabel: string;
    detailPlaceholder: string;
    details: string[];
  }
> = {
  'custom-bakery-boxes': {
    stock: ['SBS Board', 'Kraft', 'Food-safe cardstock', 'Grease-resistant stock', 'Corrugated'],
    finishes: ['PVC Window', 'Gloss/Matte Lamination', 'Foiling', 'Embossing'],
    detailLabel: 'Food packaging need',
    detailPlaceholder: 'Select a bakery feature',
    details: ['Food-safe interior', 'Clear window', 'Grease-resistant coating', 'Handle/gable style', 'Insert/divider needed'],
  },
  'custom-candle-boxes': {
    stock: ['Rigid', '18pt Cardstock', '24pt Cardstock', 'Kraft', 'Corrugated'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'PVC Window', 'UV Coating'],
    detailLabel: 'Candle packaging need',
    detailPlaceholder: 'Select a candle feature',
    details: ['Jar insert', 'Dust cover', 'Window cutout', 'Two-piece rigid box', 'Shipping protection'],
  },
  'custom-apparel-boxes': {
    stock: ['Kraft', 'Corrugated', 'Rigid', '18pt Cardstock', '24pt Cardstock'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'UV Coating'],
    detailLabel: 'Apparel packaging need',
    detailPlaceholder: 'Select an apparel feature',
    details: ['Mailer box', 'Rigid gift box', 'Tissue-ready interior', 'Hang tag set', 'Sleeve/tray style'],
  },
  'custom-cosmetics-boxes': {
    stock: ['SBS Board', '18pt Cardstock', '24pt Cardstock', 'Rigid', 'Kraft'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'PVC Window', 'UV Coating'],
    detailLabel: 'Cosmetic packaging need',
    detailPlaceholder: 'Select a cosmetic feature',
    details: ['Product insert', 'Window cutout', 'Luxury finish', 'Retail display ready', 'Small unit carton'],
  },
  'custom-cbd-boxes': {
    stock: ['SBS Board', 'Kraft', '18pt Cardstock', '24pt Cardstock', 'Corrugated'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'UV Coating'],
    detailLabel: 'CBD packaging need',
    detailPlaceholder: 'Select a CBD feature',
    details: ['Child-resistant discussion', 'Bottle/tincture insert', 'Display box', 'Compliance label space', 'Subscription/mail-ready'],
  },
  'custom-tobacco-packaging': {
    stock: ['SBS Board', 'Kraft', '18pt Cardstock', '24pt Cardstock', 'Rigid'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'UV Coating'],
    detailLabel: 'Tobacco packaging need',
    detailPlaceholder: 'Select a tobacco feature',
    details: ['Pre-roll insert', 'Cigar band/box', 'Display-ready box', 'Compliance label space', 'Odor-resistant discussion'],
  },
  'custom-rigid-boxes': {
    stock: ['Rigid', 'Wrapped rigid board', 'Kraft', '24pt Cardstock'],
    finishes: ['Foiling', 'Embossing', 'Debossing', 'UV Coating'],
    detailLabel: 'Rigid box need',
    detailPlaceholder: 'Select a rigid box feature',
    details: ['Magnetic closure', 'Drawer style', 'Two-piece setup', 'Foam/paper insert', 'Luxury presentation'],
  },
  'custom-insert-boxes': {
    stock: ['SBS Board', 'Kraft', 'Corrugated', 'Rigid'],
    finishes: ['Embossing', 'Debossing', 'Foiling', 'UV Coating'],
    detailLabel: 'Insert need',
    detailPlaceholder: 'Select an insert feature',
    details: ['Foam insert', 'Paperboard insert', 'Molded pulp insert', 'Multi-product divider', 'Fragile-item support'],
  },
  'custom-mailer-boxes': {
    stock: ['Corrugated', 'Kraft', 'White corrugated', 'Eco (recycled kraft)'],
    finishes: ['Inside printing', 'Outside printing', 'UV Coating'],
    detailLabel: 'Mailer need',
    detailPlaceholder: 'Select a mailer feature',
    details: ['E-commerce shipping', 'Subscription box', 'Inside print', 'Tear strip', 'Product insert'],
  },
  'custom-food-boxes': {
    stock: ['Food-safe cardstock', 'Kraft', 'SBS Board', 'Grease-resistant stock', 'Corrugated'],
    finishes: ['PVC Window', 'Gloss/Matte Lamination', 'UV Coating'],
    detailLabel: 'Food packaging need',
    detailPlaceholder: 'Select a food feature',
    details: ['Food-safe interior', 'Grease-resistant coating', 'Clear window', 'Takeout-ready', 'Freezer/fridge discussion'],
  },
};

const selectClass =
  'h-11 w-full rounded-md border border-ink-100 bg-white px-3 text-sm text-ink-900 transition-[border-color,box-shadow] duration-200 ease-brand hover:border-slate-400 focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)] focus:outline-none';

export interface ProductSpecConfiguratorProps {
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  productPath: string;
}

function Field({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const id = `spec-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-700">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ProductSpecConfigurator({
  productSlug,
  productName,
  categorySlug,
  categoryName,
  productPath,
}: ProductSpecConfiguratorProps) {
  const router = useRouter();
  const preset = CATEGORY_PRESETS[categorySlug] ?? {
    stock: BASE_STOCK,
    finishes: BASE_FINISHES,
    detailLabel: 'Packaging need',
    detailPlaceholder: 'Select a product-specific need',
    details: ['Retail display', 'Shipping protection', 'Gift presentation', 'Insert/divider needed', 'Window cutout'],
  };
  const [stock, setStock] = useState('');
  const [colors, setColors] = useState('');
  const [surface, setSurface] = useState('');
  const [lamination, setLamination] = useState('');
  const [detail, setDetail] = useState('');
  const [artwork, setArtwork] = useState('');
  const [deadline, setDeadline] = useState('');
  const [finishes, setFinishes] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const href = useMemo(() => {
    const p = new URLSearchParams({ product: productSlug });
    if (stock) p.set('stock', stock);
    if (colors) p.set('colors', colors);
    if (surface) p.set('surface', surface);
    if (lamination) p.set('lamination', lamination);
    if (finishes.length) p.set('finishes', finishes.join(','));
    const notes = [
      `Product: ${productName}`,
      `Category: ${categoryName}`,
      detail ? `${preset.detailLabel}: ${detail}` : undefined,
      artwork ? `Artwork status: ${artwork}` : undefined,
      deadline ? `Deadline: ${deadline}` : undefined,
      `Product page: ${productPath}`,
    ].filter(Boolean);
    p.set('notes', notes.join('\n'));
    return `/get-custom-quote/?${p.toString()}`;
  }, [
    productSlug,
    productName,
    categoryName,
    productPath,
    preset.detailLabel,
    stock,
    colors,
    surface,
    lamination,
    detail,
    artwork,
    deadline,
    finishes,
  ]);

  const toggleFinish = (f: string) =>
    setFinishes((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-e1">
      <p className="eyebrow mb-1">{categoryName}</p>
      <h2 className="h4">Build your {productName} quote</h2>
      <p className="mb-4 text-sm text-slate-600">
        Pick the options that matter for this product and we&rsquo;ll pre-fill your quote — no obligation, free design support included.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Stock" value={stock} onChange={setStock} options={preset.stock ?? BASE_STOCK} placeholder="Select a stock" />
        <Field label="Printing" value={colors} onChange={setColors} options={COLORS} placeholder="Select colors" />
        <Field label="Print surface" value={surface} onChange={setSurface} options={SURFACE} placeholder="Select surface" />
        <Field label="Lamination" value={lamination} onChange={setLamination} options={LAMINATION} placeholder="Select lamination" />
        <Field label={preset.detailLabel} value={detail} onChange={setDetail} options={preset.details} placeholder={preset.detailPlaceholder} />
        <Field label="Artwork status" value={artwork} onChange={setArtwork} options={ARTWORK} placeholder="Select artwork status" />
        <div className="sm:col-span-2">
          <Field label="Deadline" value={deadline} onChange={setDeadline} options={DEADLINES} placeholder="Select a deadline" />
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-ink-700">
          Finishes <span className="font-normal text-slate-600">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(preset.finishes ?? BASE_FINISHES).map((f) => {
            const on = finishes.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFinish(f)}
                className={`press rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-brand ${
                  on
                    ? 'border-terra-500 bg-terra-100 text-terra-600'
                    : 'border-ink-100 bg-white text-ink-700 hover:border-slate-400'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5">
        <Button
          href={href}
          onClick={(event) => {
            event.preventDefault();
            setConfirmOpen(true);
          }}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
        >
          Get a Quote with these specs
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => router.push(href)} title="Continue with these specifications?" description="Your selected product options will be carried into the full quote request form, where you can review them before submitting." confirmLabel="Continue to quote" />
    </div>
  );
}
