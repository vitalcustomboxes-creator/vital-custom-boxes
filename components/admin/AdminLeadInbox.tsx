'use client';

import { Download, Eye, Inbox, LoaderCircle, Mail, PackageSearch, Paperclip, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Tabs } from '@/components/ui/tabs';
import { deleteSubmission, fetchSubmissions, updateSubmissionStatus, SUBMISSIONS_PAGE_SIZE, type AdminSubmission, type SubmissionTab } from '@/lib/firebase/submissions';
import { deleteLeadArtworkFiles, downloadLeadArtwork, fetchLeadArtworkUrl } from '@/lib/r2-client';

const tabs: Array<{ value: SubmissionTab; label: string; icon: typeof Mail }> = [
  { value: 'contact', label: 'Contact', icon: Mail },
  { value: 'quote', label: 'Quotes', icon: PackageSearch },
  { value: 'sample', label: 'Samples', icon: Inbox },
];

/** A label/value line in the detail view. `href` renders it as a link. */
interface DetailRow {
  label: string;
  value: unknown;
  href?: string;
  /** Long-form copy gets its own full-width block rather than a table row. */
  block?: boolean;
}

interface DetailSection {
  title: string;
  rows: DetailRow[];
  tinted?: boolean;
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
}

/**
 * Group a submission into the sections sales actually reads, in order.
 *
 * Anything not claimed by a section falls through to "Other details" — a
 * curated layout must never silently swallow a field, because the forms and
 * this component are free to drift apart.
 */
function detailSections(tab: SubmissionTab, data: Record<string, unknown>): DetailSection[] {
  const claimed = new Set<string>(['status', 'submissionType']);
  const take = (key: string) => {
    claimed.add(key);
    return data[key];
  };

  const email = take('email');
  const phone = take('phone');
  const customer: DetailRow[] = [
    { label: 'Name', value: take('name') },
    { label: 'Company', value: take('company') },
    { label: 'Email', value: email, href: hasValue(email) ? `mailto:${String(email)}` : undefined },
    { label: 'Phone', value: phone, href: hasValue(phone) ? `tel:${String(phone).replace(/[^+\d]/g, '')}` : undefined },
  ];

  const sections: DetailSection[] = [];

  if (tab === 'quote') {
    const product = take('productName') ?? take('product');
    customer.push({ label: 'Shipping Location', value: take('country') });
    claimed.add('categorySlug');
    claimed.add('boxType');
    sections.push({ title: 'Customer Information', rows: customer, tinted: true });

    const [length, width, depth] = [take('length'), take('width'), take('depth')];
    sections.push({
      title: 'Order Specifications',
      rows: [
        {
          label: 'Dimensions',
          value: [length, width, depth].every(hasValue) ? `${length}" × ${width}" × ${depth}"` : undefined,
        },
        { label: 'Stock Type', value: take('stock') },
        { label: 'Color Options', value: take('colors') },
        { label: 'Color Surface', value: take('surface') },
        { label: 'Lamination', value: take('lamination') },
        { label: 'Quantity', value: take('quantity') },
        { label: 'Finishing Options', value: take('finishes') },
      ],
    });
    sections.push({
      title: 'Product',
      rows: [
        { label: 'Product', value: product },
        { label: 'Category', value: take('categoryName') },
        { label: 'Requested from', value: take('sourcePath') },
      ],
    });
  } else if (tab === 'sample') {
    sections.push({ title: 'Customer Information', rows: customer, tinted: true });
    sections.push({
      title: 'Sample Request',
      rows: [
        { label: 'Product Interest', value: take('productInterest') },
        { label: 'Shipping Address', value: take('address'), block: true },
      ],
    });
  } else {
    customer.push({ label: 'Country', value: take('country') });
    sections.push({ title: 'Customer Information', rows: customer, tinted: true });
    sections.push({
      title: 'Message',
      rows: [
        { label: 'Subject', value: take('subject') },
        { label: 'Message', value: take('message'), block: true },
      ],
    });
  }

  // Rendered by ArtworkCard, which needs download buttons rather than text.
  claimed.add('artwork');

  const notes = take('notes');
  if (hasValue(notes)) {
    sections.push({ title: 'Additional Information', rows: [{ label: 'Notes', value: notes, block: true }] });
  }

  const remaining = Object.entries(data)
    .filter(([key, value]) => !claimed.has(key) && hasValue(value))
    .map(([key, value]) => ({ label: labelFor(key), value }));
  if (remaining.length) sections.push({ title: 'Other details', rows: remaining });

  return sections.filter((section) => section.rows.some((row) => hasValue(row.value)));
}

const statusOptions: Record<SubmissionTab, Array<{ value: string; label: string }>> = {
  contact: [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'replied', label: 'Replied' },
    { value: 'done', label: 'Done' },
  ],
  quote: [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'quote-sent', label: 'Quote sent' },
    { value: 'won', label: 'Won' },
    { value: 'done', label: 'Done' },
  ],
  sample: [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'done', label: 'Done' },
  ],
};

const statusClasses: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  'in-progress': 'border-blue-200 bg-blue-50 text-blue-700',
  reviewing: 'border-blue-200 bg-blue-50 text-blue-700',
  preparing: 'border-violet-200 bg-violet-50 text-violet-700',
  replied: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  'quote-sent': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  won: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  done: 'border-slate-200 bg-slate-100 text-slate-700',
};

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

interface ArtworkRef {
  key: string;
  name: string;
  size?: number;
  type?: string;
}

/** Tolerant of older leads: anything without a usable key is ignored. */
function artworkOf(data: Record<string, unknown>): ArtworkRef[] {
  const raw = data.artwork;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const { key, name, size, type } = entry as Record<string, unknown>;
    if (typeof key !== 'string' || !key) return [];
    return [{
      key,
      name: typeof name === 'string' && name ? name : key.split('/').pop() ?? 'artwork',
      size: typeof size === 'number' ? size : undefined,
      type: typeof type === 'string' ? type : undefined,
    }];
  });
}

function fileSize(bytes?: number) {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** AI and EPS have no browser renderer — those are download-only. */
const VIEWABLE = /\.(pdf|png|jpe?g)$/i;

function canPreview(file: ArtworkRef) {
  return VIEWABLE.test(file.name) || VIEWABLE.test(file.key);
}

function ArtworkCard({ files }: { files: ArtworkRef[] }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const download = async (file: ArtworkRef) => {
    setBusy(file.key);
    setError('');
    try {
      await downloadLeadArtwork(file.key, file.name);
    } catch {
      setError('That file could not be downloaded. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const view = async (file: ArtworkRef) => {
    // Opened synchronously: a tab opened after `await` is treated as a popup
    // and blocked. It is filled in once the bytes arrive.
    const tab = window.open('', '_blank');
    setBusy(file.key);
    setError('');
    try {
      const url = await fetchLeadArtworkUrl(file.key);
      if (tab) tab.location.href = url;
      else setError('Allow pop-ups for this site to preview artwork, or use Download.');
    } catch {
      tab?.close();
      setError('That file could not be opened. Please try again.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <h3 className="border-b border-slate-200 px-4 py-3 font-display text-base font-bold text-ink-900 sm:px-5">
        Artwork ({files.length})
      </h3>
      {error && <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 sm:px-5">{error}</p>}
      <ul className="divide-y divide-slate-100">
        {files.map((file) => (
          <li key={file.key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Paperclip size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                {file.size !== undefined && <p className="text-xs text-slate-500">{fileSize(file.size)}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canPreview(file) && (
                <Button variant="secondary" size="sm" disabled={busy === file.key} onClick={() => { void view(file); }} className="gap-2">
                  <Eye size={15} /> View
                </Button>
              )}
              <Button variant="secondary" size="sm" disabled={busy === file.key} onClick={() => { void download(file); }} className="gap-2">
                <Download size={15} /> {busy === file.key ? 'Preparing…' : 'Download'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailValue({ row }: { row: DetailRow }) {
  const text = displayValue(row.value);
  if (row.href) {
    return <a href={row.href} className="break-words text-blue-700 underline underline-offset-2 hover:text-blue-900">{text}</a>;
  }
  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

function DetailCard({ section }: { section: DetailSection }) {
  const rows = section.rows.filter((row) => hasValue(row.value));
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 ${section.tinted ? 'bg-blue-50/50' : 'bg-white'}`}>
      <h3 className="border-b border-slate-200 px-4 py-3 font-display text-base font-bold text-ink-900 sm:px-5">{section.title}</h3>
      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className={row.block
              ? 'px-4 py-3 sm:px-5'
              : 'grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4 sm:px-5'}
          >
            <dt className="text-sm font-bold text-slate-600">{row.label}</dt>
            <dd className={`min-w-0 text-sm text-slate-800 ${row.block ? 'mt-1' : ''}`}><DetailValue row={row} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function statusOf(item: AdminSubmission) {
  const status = String(item.data.status ?? 'pending');
  return status === 'new' ? 'pending' : status;
}

export function AdminLeadInbox() {
  const [tab, setTab] = useState<SubmissionTab>('contact');
  const [items, setItems] = useState<AdminSubmission[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AdminSubmission | null>(null);
  const [deleting, setDeleting] = useState<AdminSubmission | null>(null);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removing, setRemoving] = useState(false);

  /** Reload from the top. Costs one page of reads, not the whole collection. */
  const reload = useCallback(async (activeTab: SubmissionTab) => {
    setLoading(true);
    setError('');
    try {
      const page = await fetchSubmissions(activeTab);
      setItems(page.items);
      setCursor(page.cursor);
    } catch {
      setItems([]);
      setCursor(null);
      setError('These submissions could not be loaded from Firebase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    void reload(tab);
  }, [reload, tab]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchSubmissions(tab, cursor);
      // Guard against a record deleted between pages showing up twice.
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...page.items.filter((item) => !seen.has(item.id))];
      });
      setCursor(page.cursor);
    } catch {
      setError('The next page of submissions could not be loaded.');
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => Object.values(item.data).some((value) => displayValue(value).toLowerCase().includes(needle)));
  }, [items, query]);

  const remove = async () => {
    if (!deleting || removing) return;
    setRemoving(true);
    try {
      // Read the artwork keys first: they exist only on this document, so once
      // it is gone the files can never be identified again.
      const keys = artworkOf(deleting.data).map((file) => file.key);
      await deleteSubmission(tab, deleting.id);
      // No live listener to drop it for us any more.
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      if (selected?.id === deleting.id) setSelected(null);
      await deleteLeadArtworkFiles(keys).catch(() => {
        setError('The submission was deleted, but its artwork files need manual cleanup in R2.');
      });
    } catch {
      setError('The submission could not be deleted. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  const changeStatus = async (item: AdminSubmission, status: string) => {
    try {
      await updateSubmissionStatus(tab, item.id, status);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, data: { ...entry.data, status } } : entry));
      setSelected((current) => current?.id === item.id ? { ...current, data: { ...current.data, status } } : current);
      setError('');
    } catch {
      setError('The submission status could not be updated. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-600">Firebase inbox</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Form submissions</h1><p className="mt-1 text-sm text-slate-500">Customer requests are separated by form type.</p></div>
        <label className="relative w-full sm:w-72"><span className="sr-only">Search submissions</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search submissions..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100" /></label>
      </div>

      <Tabs
        defaultTabId="contact"
        ariaLabel="Submission types"
        onTabChange={(value) => setTab(value as SubmissionTab)}
        className="mt-6"
        panelClassName="hidden"
        items={tabs.map(({ value, label, icon: Icon }) => ({ id: value, label: <span className="flex items-center gap-2"><Icon size={16} />{label}</span>, content: null }))}
      />

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-display text-lg font-bold">{tabs.find((item) => item.value === tab)?.label} submissions</h2>
            <p className="text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? 'record' : 'records'} loaded{cursor ? ' — older ones below' : ''}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { void reload(tab); }} disabled={loading} className="shrink-0 gap-2">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
        {loading ? <div className="px-5 py-16 text-center text-sm text-slate-500">Loading Firebase submissions…</div> : filtered.length === 0 ? <div className="px-5 py-16 text-center"><Inbox className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-bold">No submissions found</p><p className="mt-1 text-sm text-slate-500">New requests appear here after a refresh.</p></div> : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article key={item.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-5">
                <button onClick={() => setSelected(item)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-bold text-ink-900">{displayValue(item.data.name)}</p><p className="text-sm text-slate-500">{displayValue(item.data.email)}</p>{item.data.productName ? <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800"><PackageSearch size={12} />{displayValue(item.data.productName)}</span> : null}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{displayValue(item.data.message ?? item.data.notes ?? item.data.productInterest ?? item.data.productName)}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.createdAt ? item.createdAt.toLocaleString() : 'Date unavailable'}</p>
                </button>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2"><label><span className="sr-only">Status for {displayValue(item.data.name)}</span><select value={statusOf(item)} onChange={(event) => { void changeStatus(item, event.target.value); }} className={`h-9 rounded-lg border px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-300 ${statusClasses[statusOf(item)] ?? statusClasses.pending}`}>{statusOptions[tab].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><Button variant="secondary" size="sm" onClick={() => setSelected(item)}>View</Button><button aria-label="Delete submission" onClick={() => setDeleting(item)} className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={17} /></button></div>
              </article>
            ))}
          </div>
        )}
        {cursor && !loading && (
          <div className="border-t border-slate-100 px-4 py-4 text-center sm:px-5">
            <Button variant="secondary" size="sm" onClick={() => { void loadMore(); }} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : `Load ${SUBMISSIONS_PAGE_SIZE} older`}
            </Button>
            <p className="mt-2 text-xs text-slate-400">Search covers the submissions loaded so far.</p>
          </div>
        )}
      </section>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title="Submission details" className="sm:!max-w-[min(720px,calc(100vw-2rem))]">
        {selected && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-slate-700">
                <span>Submission status</span>
                <select
                  value={statusOf(selected)}
                  onChange={(event) => { void changeStatus(selected, event.target.value); }}
                  className={`h-10 rounded-lg border px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-300 ${statusClasses[statusOf(selected)] ?? statusClasses.pending}`}
                >
                  {statusOptions[tab].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <p className="mt-2 text-xs text-slate-500">
                Received {selected.createdAt ? selected.createdAt.toLocaleString() : 'at an unknown time'}
              </p>
            </div>
            {detailSections(tab, selected.data).map((section) => (
              <DetailCard key={section.title} section={section} />
            ))}
            {artworkOf(selected.data).length > 0 && <ArtworkCard files={artworkOf(selected.data)} />}
          </div>
        )}
      </Modal>
      {/* Closing mid-delete would strand the dialog's state, so the whole
          dialog locks until the write settles. */}
      <Modal open={deleting !== null} onClose={() => { if (!removing) setDeleting(null); }} title="Delete submission">
        <p className="text-sm leading-6 text-slate-600">Permanently delete this Firebase record?</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" disabled={removing} onClick={() => setDeleting(null)}>Cancel</Button>
          <Button size="sm" disabled={removing} onClick={() => { void remove(); }} className="gap-2 bg-red-600 text-white hover:bg-red-500 hover:text-white disabled:cursor-wait disabled:opacity-70">
            {removing && <LoaderCircle size={15} className="animate-spin" />}
            {removing ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
