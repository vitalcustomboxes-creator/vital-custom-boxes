'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CirclePlus,
  CloudOff,
  ImagePlus,
  LoaderCircle,
  Package,
  Save,
  Trash2,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { slugifyProductName, type AdminProduct, type CategoryOption } from '@/lib/admin-product';
import { clearProductDraft, fileToDataUrl, getProductDraft, saveProductDraft } from '@/lib/admin-persistence';
import { observeAdminAuth } from '@/lib/firebase/auth';
import { getProductDocument, reserveProductSlug, saveProductDocument } from '@/lib/firebase/products';
import { deleteManagedProductImages, uploadProductImageDataUrl } from '@/lib/r2-client';

const fieldClass = 'h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100';
const textareaClass = `${fieldClass} h-auto resize-y py-3`;

function lines(value: string) {
  return value.split('\n');
}

function cleanLines(value: string[]) {
  return value.map((item) => item.trim()).filter(Boolean);
}

function normalizeProduct(product: AdminProduct, fallback: AdminProduct): AdminProduct {
  return {
    ...fallback,
    ...product,
    images: product.images ?? [],
    related: product.related ?? [],
    highlights: product.highlights ?? [],
    materials: product.materials ?? [],
    finishes: product.finishes ?? [],
    bestFor: product.bestFor ?? [],
    faqs: product.faqs ?? [],
  };
}

function imageUrls(product: AdminProduct) {
  return [product.imageUrl, ...product.images.map((image) => image.src)].filter(Boolean);
}

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 border-b border-slate-100 p-4 sm:p-6">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-xs font-extrabold text-amber-700">{number}</span>
        <div className="min-w-0"><h2 className="font-display text-base font-bold text-ink-900 sm:text-lg">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500 sm:leading-6">{description}</p></div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

function ListField({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (value: string[]) => void; hint: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink-700">
      {label}
      <textarea aria-label={label} value={value.join('\n')} onChange={(event) => onChange(lines(event.target.value))} required rows={5} className={textareaClass} placeholder="Enter one item per line" />
      <span className="text-xs font-normal leading-5 text-slate-400">{hint}</span>
    </label>
  );
}

export function ProductEditor({ mode, initialProduct, categories }: { mode: 'create' | 'edit'; initialProduct: AdminProduct; categories: CategoryOption[] }) {
  const router = useRouter();
  const draftKey = mode === 'create' ? 'create' : `edit:${initialProduct.slug}`;
  const [draft, setDraft] = useState(initialProduct);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [restored, setRestored] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [imageError, setImageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  /** Saved to Firestore, but the public snapshot rebuild failed. */
  const [publishWarning, setPublishWarning] = useState('');
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [persistedImageUrls, setPersistedImageUrls] = useState(() => imageUrls(initialProduct));

  useEffect(() => {
    return observeAdminAuth((user) => {
      setAuthorized(Boolean(user));
      if (!user) router.replace('/admin');
    });
  }, [router]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProductDraft(draftKey).catch(() => null),
      mode === 'edit' ? getProductDocument(initialProduct.slug, categories).catch(() => null) : Promise.resolve(null),
    ]).then(([saved, remoteProduct]) => {
      if (!active) return;
      if (saved) {
        setDraft(normalizeProduct(saved, initialProduct));
        setDirty(true);
        setRestored(true);
      } else if (remoteProduct) {
        setDraft(normalizeProduct(remoteProduct, initialProduct));
        setPersistedImageUrls(imageUrls(remoteProduct));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
    return () => { active = false; };
  }, [categories, draftKey, initialProduct, mode]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    if (!loaded || !dirty) return;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      saveProductDraft(draftKey, draft).then(() => setSaveState('saved')).catch(() => setSaveState('error'));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, draftKey, dirty, loaded]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const warnHistory = () => {
      if (dirty && !window.confirm('You have unsaved product changes. Leave this page?')) window.history.forward();
    };
    window.addEventListener('beforeunload', warn);
    window.addEventListener('popstate', warnHistory);
    return () => { window.removeEventListener('beforeunload', warn); window.removeEventListener('popstate', warnHistory); };
  }, [dirty]);

  const update = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) => {
    setDirty(true);
    setSaveState('idle');
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const choosePrimaryImage = async (file?: File) => {
    if (!file) return;
    update('imageUrl', await fileToDataUrl(file));
    setImageError('');
  };

  const addGalleryImages = async (files: FileList | null) => {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    const added = await Promise.all(selected.map(async (file) => ({ src: await fileToDataUrl(file), alt: '' })));
    update('images', [...draft.images, ...added]);
  };

  const leave = () => {
    if (submitPhase !== 'idle') return;
    if (!dirty || window.confirm('You have unsaved product changes. Leave this page?')) router.push('/admin');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitPhase !== 'idle') return;
    if (!draft.imageUrl) {
      setImageError('Please add a primary product image.');
      document.getElementById('product-images')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // The slug is derived from the name when the product is created and then
    // frozen: it is the public URL, so renaming a product must not break links.
    const baseSlug = mode === 'edit' ? draft.slug : slugifyProductName(draft.name);
    if (!baseSlug) {
      setSubmitError('Please use a product name that contains letters or numbers.');
      return;
    }
    const categoryName = categories.find((item) => item.slug === draft.category)?.name ?? draft.category;
    let product = {
      ...draft,
      categoryName,
      related: cleanLines(draft.related),
      highlights: cleanLines(draft.highlights),
      materials: cleanLines(draft.materials),
      finishes: cleanLines(draft.finishes),
      bestFor: cleanLines(draft.bestFor),
    };
    setSaveState('saving');
    setSubmitError('');
    setPublishWarning('');
    const hasPendingImages = product.imageUrl.startsWith('data:') || product.images.some((image) => image.src.startsWith('data:'));
    setSubmitPhase(hasPendingImages ? 'uploading' : 'saving');
    const uploadedUrls: string[] = [];
    try {
      if (mode === 'create') product = { ...product, slug: await reserveProductSlug(baseSlug) };
      if (product.imageUrl.startsWith('data:')) {
        product = { ...product, imageUrl: await uploadProductImageDataUrl(product.imageUrl, product.slug) };
        uploadedUrls.push(product.imageUrl);
      }
      const uploadedGallery = await Promise.all(product.images.map(async (image) => {
        if (!image.src.startsWith('data:')) return image;
        const src = await uploadProductImageDataUrl(image.src, product.slug);
        uploadedUrls.push(src);
        return { ...image, src };
      }));
      product = { ...product, images: uploadedGallery };
      setSubmitPhase('saving');
      const { published } = await saveProductDocument(product, mode === 'edit' ? initialProduct.slug : product.slug);
      await clearProductDraft(draftKey);
      const retained = new Set(imageUrls(product));
      const removedUrls = persistedImageUrls.filter((url) => !retained.has(url));
      await deleteManagedProductImages(removedUrls).catch(() => undefined);
      setDirty(false);
      setSaveState('saved');
      if (!published) {
        // The product is saved, but the public snapshot was not rebuilt, so the
        // live site still shows the old catalog. Stay put rather than navigating
        // away — saving again is the retry, and it is one click from here.
        setPublishWarning(
          'Saved to the catalog, but the live site could not be updated. Save again to retry.',
        );
        setSubmitPhase('idle');
        return;
      }
      router.push('/admin');
    } catch (error) {
      await deleteManagedProductImages(uploadedUrls).catch(() => undefined);
      setSaveState('error');
      setSubmitError(error instanceof Error ? error.message : 'The product could not be saved. Please try again.');
      setSubmitPhase('idle');
    }
  };

  const submitting = submitPhase !== 'idle';
  const submitLabel = submitPhase === 'uploading'
    ? 'Uploading images…'
    : submitPhase === 'saving'
      ? mode === 'create' ? 'Creating product…' : 'Updating product…'
      : mode === 'create' ? 'Create product' : 'Save changes';

  if (authorized !== true || !loaded) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading product workspace…</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900">
      {!isOnline && <div role="status" className="flex items-center justify-center gap-2 bg-slate-950 px-4 py-2 text-center text-xs font-semibold text-white"><CloudOff size={15} /> You are offline. Your draft is still saved on this device.</div>}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={leave} disabled={submitting} aria-label="Back to products" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ArrowLeft size={19} /></button>
            <span className="hidden h-10 w-px bg-slate-200 sm:block" />
            <div className="min-w-0"><p className="hidden text-xs font-bold uppercase tracking-[.15em] text-amber-600 sm:block">Product catalog</p><h1 className="truncate font-display text-lg font-bold sm:text-2xl">{mode === 'create' ? 'Create product' : `Edit ${draft.name || initialProduct.name || 'product'}`}</h1></div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="hidden text-xs text-slate-400 lg:inline">{saveState === 'saving' ? 'Saving draft…' : saveState === 'saved' ? 'Draft saved locally' : saveState === 'error' ? 'Draft could not be saved' : dirty ? 'Unsaved changes' : 'No changes'}</span>
            <button type="submit" form="product-editor-form" disabled={submitting} className="flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70">{submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />} {submitLabel}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] overflow-x-hidden px-3 pb-24 pt-4 sm:px-6 sm:py-8 lg:px-8">
        {restored && <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><Check className="mt-0.5 shrink-0" size={17} /><div><p className="font-bold">Your unsaved draft was restored.</p><p className="mt-1 text-xs leading-5 text-blue-700">Continue where you left off. The draft will be cleared after a successful save.</p></div></div>}
        {submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{submitError}</div>}
        {publishWarning && <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{publishWarning}</div>}
        {submitting && <div role="status" aria-live="polite" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900"><LoaderCircle className="shrink-0 animate-spin" size={18} /> {submitLabel} Please keep this page open.</div>}
        <form id="product-editor-form" aria-label={`${mode === 'create' ? 'Create' : 'Edit'} product form`} aria-busy={submitting} onSubmit={submit} className={`grid min-w-0 items-start gap-4 transition-opacity sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px] ${submitting ? 'opacity-60' : ''}`}>
          <fieldset disabled={submitting} className="contents">
          <div className="grid min-w-0 gap-4 sm:gap-6">
            <Section number="01" title="Basic information" description="Product identity, routing, and catalog placement.">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Product name<input value={draft.name} onChange={(event) => update('name', event.target.value)} required className={fieldClass} /></label>
                <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Category<select value={draft.category} onChange={(event) => update('category', event.target.value)} required className={fieldClass}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
                <label className="grid gap-1.5 text-sm font-semibold text-ink-700">SKU <span className="font-normal text-slate-400">(optional)</span><input value={draft.sku} onChange={(event) => update('sku', event.target.value)} className={fieldClass} /></label>
                <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Copy status<select value={draft.copyStatus} onChange={(event) => update('copyStatus', event.target.value as AdminProduct['copyStatus'])} required className={fieldClass}><option value="live">Live</option><option value="derived">Derived</option></select></label>
                <label className="grid gap-1.5 text-sm font-semibold text-ink-700">SEO / page title<input value={draft.title} onChange={(event) => update('title', event.target.value)} required className={fieldClass} /></label>
              </div>
            </Section>

            <Section number="02" title="Product description" description="Main copy displayed on the product detail page.">
              <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Description<textarea value={draft.description} onChange={(event) => update('description', event.target.value)} required rows={9} className={textareaClass} /></label>
            </Section>

            <div id="product-images"><Section number="03" title="Product images" description="Choose a primary card image and optional gallery images. New images upload to R2 when you save.">
              <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                <div className="grid max-w-sm gap-2 md:max-w-none">
                  <p className="text-sm font-semibold text-ink-700">Primary image</p>
                  {draft.imageUrl ? <div className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><Image src={draft.imageUrl} alt="Primary product preview" fill sizes="240px" unoptimized={draft.imageUrl.startsWith('data:')} className="object-contain p-3" /><div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-slate-950/75 p-3"><label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold">Replace<input aria-label="Replace primary image" type="file" accept="image/*" className="sr-only" onChange={(event) => { void choosePrimaryImage(event.target.files?.[0]); event.target.value = ''; }} /></label><button type="button" onClick={() => update('imageUrl', '')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Remove</button></div></div> : <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-amber-400"><span className="grid justify-items-center gap-2"><span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700"><ImagePlus size={22} /></span><strong className="text-sm">Add primary image</strong><span className="text-xs text-slate-400">PNG, JPG, WEBP or AVIF</span></span><input aria-label="Upload primary image" type="file" accept="image/*" className="sr-only" onChange={(event) => { void choosePrimaryImage(event.target.files?.[0]); event.target.value = ''; }} /></label>}
                  {imageError && <p role="alert" className="text-xs font-semibold text-red-600">{imageError}</p>}
                </div>
                <div className="grid content-start gap-5">
                  <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Primary image alt text<input aria-label="Primary image alt text" value={draft.imageAlt} onChange={(event) => update('imageAlt', event.target.value)} required className={fieldClass} /><span className="text-xs font-normal text-slate-400">Describe the image for accessibility and search engines.</span></label>
                  <div className="grid gap-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-ink-700">Gallery images <span className="font-normal text-slate-400">(optional)</span></p><label className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-amber-700"><CirclePlus size={16} /> Add images<input aria-label="Add gallery images" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { void addGalleryImages(event.target.files); event.target.value = ''; }} /></label></div>{draft.images.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400">No gallery images added.</p>}{draft.images.map((image, index) => <div key={`${image.src.slice(0, 30)}-${index}`} className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center"><div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-white sm:h-20 sm:w-20"><Image src={image.src} alt="" fill sizes="80px" unoptimized={image.src.startsWith('data:')} className="object-contain p-1" /></div><label className="grid min-w-0 gap-1.5 text-xs font-semibold">Image {index + 1} alt text<input aria-label={`Gallery image ${index + 1} alt text`} value={image.alt} required onChange={(event) => update('images', draft.images.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item))} className={fieldClass} /></label><button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => update('images', draft.images.filter((_, itemIndex) => itemIndex !== index))} className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-sm font-semibold text-red-500 sm:col-span-1 sm:grid sm:w-11 sm:px-0"><Trash2 size={17} /><span className="sm:sr-only">Remove image</span></button></div>)}</div>
                </div>
              </div>
            </Section></div>

            <Section number="04" title="Product content" description="Structured selling points used throughout the product page.">
              <div className="grid gap-5 sm:grid-cols-2"><ListField label="Highlights" value={draft.highlights} onChange={(value) => update('highlights', value)} hint="Product benefits; one per line." /><ListField label="Best for" value={draft.bestFor} onChange={(value) => update('bestFor', value)} hint="Recommended uses; one per line." /><ListField label="Materials" value={draft.materials} onChange={(value) => update('materials', value)} hint="Available stocks; one per line." /><ListField label="Finishes" value={draft.finishes} onChange={(value) => update('finishes', value)} hint="Available finishes; one per line." /></div>
            </Section>

            <Section number="05" title="Related products" description="Connect this item to other products using their catalog slugs.">
              <label className="grid gap-1.5 text-sm font-semibold text-ink-700">Related product slugs <span className="font-normal text-slate-400">(optional)</span><textarea value={draft.related.join('\n')} onChange={(event) => update('related', lines(event.target.value))} rows={5} className={textareaClass} placeholder="custom-mailer-boxes&#10;custom-shipping-boxes" /><span className="text-xs font-normal text-slate-400">Enter one slug per line.</span></label>
            </Section>

            <Section number="06" title="Frequently asked questions" description="Questions and answers displayed below the product details.">
              <div className="grid gap-4"><div className="flex justify-end"><button type="button" onClick={() => update('faqs', [...draft.faqs, { question: '', answer: '' }])} className="flex items-center gap-1.5 text-sm font-bold text-amber-700"><CirclePlus size={16} /> Add FAQ</button></div>{draft.faqs.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">No FAQs added yet.</p>}{draft.faqs.map((faq, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold">FAQ {index + 1}</p><button type="button" aria-label={`Remove FAQ ${index + 1}`} onClick={() => update('faqs', draft.faqs.filter((_, itemIndex) => itemIndex !== index))} className="text-red-500"><Trash2 size={17} /></button></div><label className="grid gap-1.5 text-xs font-semibold">Question<input aria-label={`FAQ ${index + 1} question`} value={faq.question} onChange={(event) => update('faqs', draft.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} className={fieldClass} /></label><label className="grid gap-1.5 text-xs font-semibold">Answer<textarea aria-label={`FAQ ${index + 1} answer`} value={faq.answer} onChange={(event) => update('faqs', draft.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} rows={4} className={textareaClass} /></label></div>)}</div>
            </Section>
          </div>

          <aside className="grid min-w-0 gap-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><Package size={19} /></span><div><p className="text-sm font-bold">Product status</p><p className="text-xs text-slate-400">{draft.copyStatus === 'live' ? 'Ready for the live catalog' : 'Derived catalog copy'}</p></div></div><dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-400">Draft</dt><dd className="font-semibold">{saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved locally' : dirty ? 'Unsaved' : 'Unchanged'}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Connection</dt><dd className={`font-semibold ${isOnline ? 'text-emerald-600' : 'text-amber-700'}`}>{isOnline ? 'Online' : 'Offline'}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Images</dt><dd className="font-semibold">{draft.imageUrl ? 1 + draft.images.length : draft.images.length}</dd></div></dl></div>
            <div className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block"><button type="submit" disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70">{submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />} {submitLabel}</button><button type="button" onClick={leave} disabled={submitting} className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button><p className="mt-4 text-center text-xs leading-5 text-slate-400">Unsaved changes are automatically stored on this device.</p></div>
          </aside>
          </fieldset>
        </form>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-3 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur sm:hidden"><span className="min-w-0 truncate text-xs text-slate-400">{submitting ? submitLabel : saveState === 'saving' ? 'Saving draft…' : saveState === 'saved' ? 'Draft saved' : dirty ? 'Unsaved changes' : 'No changes'}</span><button type="submit" form="product-editor-form" disabled={submitting} className="flex h-11 min-w-24 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold disabled:cursor-wait disabled:opacity-70">{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />} {submitting ? 'Working…' : mode === 'create' ? 'Create' : 'Save'}</button></div>
    </div>
  );
}
