'use client';

/**
 * QuoteForm — Client Component (FE-3). DESIGN_SPEC §6.9 + task spec.
 *
 * Single-step quote form matching the Vital quote form layout:
 * dimensions, name, email, phone, stock, color, color surface, lamination,
 * quantity, finishes (checkboxes), artwork upload, shipping country, and
 * additional information.
 *
 * - Client per-field validation with inline errors + aria-live error summary.
 * - Submit calls the `action` server-action prop (BE-3 `submitQuote`); on
 *   `{ ok: true }` → router.push('/thank-you').
 * - Honeypot: visually-hidden "website" text field (bots fill it).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  QUOTE_COLORS,
  QUOTE_FINISHES,
  QUOTE_LAMINATIONS,
  QUOTE_STOCKS,
  QUOTE_SURFACES,
} from '@/lib/quote-options';
import { applyQuoteDraft, clearQuoteDraft, readQuoteDraft, saveQuoteDraft } from '@/lib/quote-draft';
import { cn } from '@/lib/utils';
import { useProductOptions } from './use-product-options';


export interface QuoteFormProps {
  /** BE-3 server action (`submitQuote`). Receives the full FormData. */
  action: (data: FormData) => Promise<{ ok: boolean; error?: string }>;
  defaultProduct?: {
    slug: string;
    name: string;
    categorySlug?: string;
    categoryName?: string;
    sourcePath?: string;
  };
  defaultSpecs?: {
    stock?: string;
    colors?: string;
    surface?: string;
    lamination?: string;
    finishes?: string[];
    notes?: string;
  };
  /** globals.moq — rendered as the Quantity help text. */
  moq?: string;
  heading?: string;
  description?: string;
  className?: string;
}

/* --------------------------------- constants -------------------------------- */

const MAX_FILES = 5;
const MIN_QUANTITY = 25;

/* -------------------------------- validation -------------------------------- */

type FieldValidator = (raw: string) => string | null;

const dimension = (label: string): FieldValidator => (raw) => {
  const v = raw.trim();
  if (v.length < 1) return `Enter the ${label} in inches`;
  if (!(Number.isFinite(Number(v)) && Number(v) > 0))
    return `${label[0].toUpperCase() + label.slice(1)} must be a number greater than 0`;
  return null;
};

const requiredField = (message: string): FieldValidator => (raw) =>
  raw.trim().length < 1 ? message : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators: Record<string, FieldValidator> = {
  length: dimension('length'),
  width: dimension('width'),
  depth: dimension('depth'),
  name: (raw) => (raw.trim().length < 2 ? 'Enter your full name' : null),
  email: (raw) => (EMAIL_RE.test(raw.trim()) ? null : 'Enter a valid email address'),
  phone: (raw) => {
    const v = raw.trim();
    if (v.length < 7 || !/^[+()\d\s.-]+$/.test(v)) return 'Enter a valid phone number';
    return null;
  },
  stock: requiredField('Select a stock'),
  colors: requiredField('Select a printing option'),
  surface: requiredField('Select a print surface'),
  lamination: requiredField('Select a lamination'),
  quantity: (raw) => {
    const v = raw.trim();
    if (v.length < 1) return 'Enter a quantity';
    if (!(Number.isInteger(Number(v)) && Number(v) >= MIN_QUANTITY))
      return `Quantity must be a whole number of ${MIN_QUANTITY} or more`;
    return null;
  },
};

const FIELD_ORDER = [
  'length', 'width', 'depth',
  'name', 'email', 'phone', 'stock',
  'colors', 'surface', 'lamination', 'quantity',
  'country', 'artwork',
];

const FIELD_LABELS: Record<string, string> = {
  length: 'Length',
  width: 'Width',
  depth: 'Depth',
  name: 'Full name',
  email: 'Email',
  phone: 'Phone',
  stock: 'Stock',
  colors: 'Printing colors',
  surface: 'Print surface',
  lamination: 'Lamination',
  quantity: 'Quantity',
  country: 'Shipping country',
  artwork: 'Artwork files',
};

const fieldId = (name: string) => `qf-${name}`;

/** What the picker commits — the subset of `defaultProduct` the lead stores. */
interface SelectedProduct {
  slug: string;
  name: string;
  categorySlug?: string;
  categoryName?: string;
}

function validationErrors(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, validate] of Object.entries(validators)) {
    const message = validate(values[field] ?? '');
    if (message) out[field] = message;
  }
  return out;
}

function readValues(form: HTMLFormElement) {
  const fd = new FormData(form);
  const values: Record<string, string> = {};
  for (const f of Object.keys(validators)) values[f] = String(fd.get(f) ?? '');
  return values;
}

/* --------------------------------- component -------------------------------- */

export function QuoteForm({
  action,
  defaultProduct,
  defaultSpecs,
  moq,
  heading = 'Get a Free Quote',
  description,
  className,
}: QuoteFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmationData, setConfirmationData] = useState<FormData | null>(null);

  /* Product picker. Seeded from `defaultProduct` so a product-page prefill
     reads back immediately, before the catalog fetch resolves. Optional by
     design — a cleared picker submits exactly as the form did before. */
  const [selected, setSelected] = useState<SelectedProduct | null>(
    defaultProduct
      ? {
          slug: defaultProduct.slug,
          name: defaultProduct.name,
          categorySlug: defaultProduct.categorySlug,
          categoryName: defaultProduct.categoryName,
        }
      : null,
  );
  const { options: catalog, loading: catalogLoading, failed: catalogFailed, load: loadCatalog } =
    useProductOptions();

  const [restored, setRestored] = useState(false);

  /**
   * Restore an unfinished request, then keep it saved as they type.
   *
   * Runs once on mount: the form is uncontrolled, so the draft is written
   * straight into the DOM rather than through React state. A `defaultProduct`
   * prefill wins over the draft's product — the visitor is on that product's
   * page, and silently swapping it for an older pick would be worse than
   * losing it.
   */
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const draft = readQuoteDraft();
    if (draft) {
      applyQuoteDraft(form, draft.values);
      if (draft.product && !defaultProduct) setSelected(draft.product);
      setRestored(true);
    }

    let timer: number | undefined;
    const persist = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => saveQuoteDraft(form), 400);
    };
    form.addEventListener('input', persist);
    form.addEventListener('change', persist);
    return () => {
      window.clearTimeout(timer);
      form.removeEventListener('input', persist);
      form.removeEventListener('change', persist);
    };
  }, [defaultProduct]);

  /**
   * Adopt a `defaultProduct` that resolves after mount.
   *
   * /get-custom-quote prefills from `?product=` on the client so the route can
   * stay static, which means the product arrives once the catalog fetch lands
   * rather than on the first render. Server-rendered callers (CTABand) pass a
   * value that is already present on mount, so this is a no-op for them.
   *
   * Deliberately narrow: it only fills an *empty* picker. Once the visitor has
   * chosen something — or restored a draft — their pick wins.
   */
  const adoptedProduct = useRef(false);
  useEffect(() => {
    if (!defaultProduct || adoptedProduct.current) return;
    adoptedProduct.current = true;
    setSelected((current) => current ?? { ...defaultProduct });
  }, [defaultProduct]);

  /** The picker is React state, so its changes never fire a form `input`. */
  useEffect(() => {
    if (formRef.current && restored) saveQuoteDraft(formRef.current);
  }, [restored, selected]);

  const discardDraft = () => {
    clearQuoteDraft();
    formRef.current?.reset();
    setSelected(defaultProduct ? { ...defaultProduct } : null);
    setErrors({});
    setRestored(false);
  };

  const productOptions = useMemo<ComboboxOption[]>(() => {
    const fromCatalog = catalog.map((product) => ({
      value: product.slug,
      label: product.name,
    }));
    // Keep the prefilled product selectable before/if the catalog never loads.
    if (selected && !catalog.some((product) => product.slug === selected.slug)) {
      return [{ value: selected.slug, label: selected.name }, ...fromCatalog];
    }
    return fromCatalog;
  }, [catalog, selected]);

  const focusFirstInvalid = (errs: Record<string, string>) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(fieldId(first))?.focus();
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = formRef.current;
    if (!form) return;

    const errs = validationErrors(readValues(form));

    const data = new FormData(form);
    const files = data
      .getAll('artwork')
      .filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES) {
      errs.artwork = `Attach up to ${MAX_FILES} files`;
    }

    setErrors(errs);
    setServerError(null);

    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(errs);
      return;
    }

    setConfirmationData(data);
  };

  const sendConfirmed = async () => {
    if (!confirmationData || pending) return;
    setPending(true);
    try {
      const result = await action(confirmationData);
      if (result.ok) {
        // Only a confirmed send clears it — a failed submit must leave the
        // visitor's work exactly where it was so they can retry.
        clearQuoteDraft();
        router.push('/thank-you');
        return;
      }
      setServerError(
        result.error ?? 'Something went wrong while sending your request. Please try again.',
      );
    } catch {
      setServerError(
        'We could not send your request. Please check your connection and try again.',
      );
    }
    setPending(false);
    setConfirmationData(null);
  };

  const errorEntries = Object.entries(errors);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      data-quote-form=""
      className={cn(
        'relative overflow-hidden rounded-lg border border-ink-100 bg-white shadow-e2',
        className,
      )}
      aria-label="Custom quote request"
    >
      {/* Header */}
      <div className="border-b border-ink-100 bg-kraft-100 px-6 py-6 md:px-10">
        <p className="eyebrow">Quote request</p>
        <h2 className="mt-2 text-2xl md:text-3xl">{heading}</h2>
        {description && (
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="p-6 md:p-10">
        {/* aria-live error summary */}
        <div aria-live="assertive" role="alert" className="mb-2 empty:mb-0">
          {(errorEntries.length > 0 || serverError) && (
            <div className="mb-6 rounded-md border border-error bg-[rgba(179,64,42,0.06)] p-4">
              <p className="text-sm font-semibold text-error">
                {serverError ??
                  `Please fix the following ${errorEntries.length === 1 ? 'field' : `${errorEntries.length} fields`}:`}
              </p>
              {!serverError && (
                <ul className="mt-2 list-disc pl-5 text-sm text-error">
                  {errorEntries.map(([field, message]) => (
                    <li key={field}>
                      {FIELD_LABELS[field] ?? field}: {message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {restored && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-100 bg-paper-50 p-4">
            <p className="text-sm text-slate-600">
              We restored your unfinished request from this device.
            </p>
            <button
              type="button"
              onClick={discardDraft}
              className="text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink-900"
            >
              Start over
            </button>
          </div>
        )}

        {/* Honeypot */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        >
          <label htmlFor="qf-website">Website</label>
          <input
            id="qf-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Hidden product context — mirrors whatever the picker holds. */}
        {selected && (
          <>
            <input type="hidden" name="product" value={selected.slug} />
            <input type="hidden" name="productName" value={selected.name} />
            {selected.categorySlug && (
              <input type="hidden" name="categorySlug" value={selected.categorySlug} />
            )}
            {selected.categoryName && (
              <input type="hidden" name="categoryName" value={selected.categoryName} />
            )}
            {/* boxType is the packaging-type enum; every product category slug
                is a valid member, so it tracks the selection. */}
            {selected.categorySlug && (
              <input type="hidden" name="boxType" value={selected.categorySlug} />
            )}
          </>
        )}

        {/* Records the page the form was on — independent of what's picked. */}
        {defaultProduct?.sourcePath && (
          <input type="hidden" name="sourcePath" value={defaultProduct.sourcePath} />
        )}

        <div className="grid gap-4">
          {/* Row 0: Product picker (optional — blank means "not sure yet") */}
          <Combobox
            id={fieldId('product')}
            label="Product"
            placeholder="Search products…"
            value={selected?.slug ?? null}
            options={productOptions}
            loading={catalogLoading}
            loadingLabel="Loading products…"
            onOpen={loadCatalog}
            onChange={(option) => {
              if (!option) {
                setSelected(null);
                return;
              }
              // The category still rides along on the lead — it just isn't
              // shown in the list. The only non-catalog option is the prefill.
              const match = catalog.find((product) => product.slug === option.value);
              setSelected({
                slug: option.value,
                name: match?.name ?? option.label,
                categorySlug: match?.category ?? defaultProduct?.categorySlug,
                categoryName: match?.categoryName ?? defaultProduct?.categoryName,
              });
            }}
            emptyLabel="No products match — describe it in Additional Information below"
            hint={
              catalogFailed
                ? 'Product list unavailable — describe your product in Additional Information.'
                : 'Optional — leave blank if you are not sure yet.'
            }
          />

          {/* Row 1: Dimensions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              id={fieldId('length')}
              name="length"
              label="Length (in)"
              type="number"
              inputMode="decimal"
              min={0.25}
              step={0.25}
              placeholder="Length (in)"
              required
              error={errors.length}
            />
            <Input
              id={fieldId('width')}
              name="width"
              label="Width (in)"
              type="number"
              inputMode="decimal"
              min={0.25}
              step={0.25}
              placeholder="Width (in)"
              required
              error={errors.width}
            />
            <Input
              id={fieldId('depth')}
              name="depth"
              label="Depth (in)"
              type="number"
              inputMode="decimal"
              min={0.25}
              step={0.25}
              placeholder="Depth (in)"
              required
              error={errors.depth}
            />
          </div>

          {/* Row 2: Name & Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id={fieldId('name')}
              name="name"
              label="Name"
              placeholder="Name*"
              required
              autoComplete="name"
              error={errors.name}
            />
            <Input
              id={fieldId('email')}
              name="email"
              label="Email"
              type="email"
              placeholder="Email*"
              required
              autoComplete="email"
              error={errors.email}
            />
          </div>

          {/* Row 3: Phone & Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id={fieldId('phone')}
              name="phone"
              label="Phone"
              type="tel"
              placeholder="Phone*"
              required
              autoComplete="tel"
              error={errors.phone}
            />
            <Select
              id={fieldId('stock')}
              name="stock"
              label="Choose Stock"
              required
              placeholder="Choose Stock"
              defaultValue={defaultSpecs?.stock}
              error={errors.stock}
              options={QUOTE_STOCKS.map((o) => ({ value: o, label: o }))}
            />
          </div>

          {/* Row 4: Color & Color Surface */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id={fieldId('colors')}
              name="colors"
              label="Choose Color"
              required
              placeholder="Choose Color"
              defaultValue={defaultSpecs?.colors}
              error={errors.colors}
              options={QUOTE_COLORS.map((o) => ({ value: o, label: o }))}
            />
            <Select
              id={fieldId('surface')}
              name="surface"
              label="Choose Color Surface"
              required
              placeholder="Choose Color Surface"
              defaultValue={defaultSpecs?.surface}
              error={errors.surface}
              options={QUOTE_SURFACES.map((o) => ({ value: o, label: o }))}
            />
          </div>

          {/* Row 5: Lamination & Quantity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id={fieldId('lamination')}
              name="lamination"
              label="Choose Lamination"
              required
              placeholder="Choose Lamination"
              defaultValue={defaultSpecs?.lamination}
              error={errors.lamination}
              options={QUOTE_LAMINATIONS.map((o) => ({ value: o, label: o }))}
            />
            <Input
              id={fieldId('quantity')}
              name="quantity"
              label="Quantity"
              type="number"
              inputMode="numeric"
              min={MIN_QUANTITY}
              step={1}
              placeholder="Quantity"
              required
              hint={moq ? `Minimum order: ${moq}` : `Minimum order: ${MIN_QUANTITY}`}
              error={errors.quantity}
            />
          </div>

          {/* Finishes checkboxes */}
          <fieldset className="rounded-lg border border-ink-100 bg-paper-50 p-4">
            <legend className="text-sm font-semibold text-ink-700">
              Additional finishes
            </legend>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {QUOTE_FINISHES.map((finish) => (
                <Checkbox
                  key={finish}
                  id={`qf-finish-${finish}`}
                  name="finishes"
                  value={finish}
                  label={finish}
                  defaultChecked={defaultSpecs?.finishes?.includes(finish)}
                />
              ))}
            </div>
          </fieldset>

          {/* File upload */}
          <div>
            <FileUpload
              id={fieldId('artwork')}
              name="artwork"
              label="Artwork / design files"
              maxFiles={MAX_FILES}
              maxSizeMb={10}
              error={errors.artwork}
              hint={`Upload up to ${MAX_FILES} files (PDF, AI, EPS, PNG, JPG — max 10 MB each)`}
            />
          </div>

          {/* Shipping Country */}
          <Input
            id={fieldId('country')}
            name="country"
            label="Shipping Country"
            placeholder="Shipping Country"
            autoComplete="country-name"
            error={errors.country}
          />

          {/* Additional Information */}
          <Textarea
            id={fieldId('notes')}
            name="notes"
            label="Additional Information"
            placeholder="Additional Information:"
            rows={6}
            defaultValue={defaultSpecs?.notes}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-xl bg-amber-500 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? 'Sending…' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmationData !== null}
        onConfirm={() => void sendConfirmed()}
        onClose={() => setConfirmationData(null)}
        title="Submit quote request?"
        description="We'll review your specs and reply with pricing — typically within one business day."
        confirmLabel="Yes, submit"
        pending={pending}
      />
    </form>
  );
}
