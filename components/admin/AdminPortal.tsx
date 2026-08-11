'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown, CirclePlus, ClipboardList, Edit3, KeyRound, LoaderCircle, LogOut, Package, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Modal } from '@/components/ui/modal';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AdminProductListItem, CategoryOption } from '@/lib/admin-product';
import { ADMIN_EMAIL, observeAdminAuth, sendAdminPasswordReset, signInAdmin, signOutAdmin } from '@/lib/firebase/auth';
import { deleteProductDocument, deleteProductDocuments } from '@/lib/firebase/products';
import { deleteManagedProductImages, getProductImageUrls } from '@/lib/r2-client';
import { AdminLeadInbox } from '@/components/admin/AdminLeadInbox';

interface AdminPortalProps {
  initialProducts: AdminProductListItem[];
  categories: CategoryOption[];
}

const PAGE_SIZE = 10;
const fieldClass = 'h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100';

type PaginationEntry = number | 'start-ellipsis' | 'end-ellipsis';

function getPaginationEntries(current: number, total: number): PaginationEntry[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'end-ellipsis', total];
  if (current >= total - 3) return [1, 'start-ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'start-ellipsis', current - 1, current, current + 1, 'end-ellipsis', total];
}

export function AdminPortal({ initialProducts, categories }: AdminPortalProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [adminView, setAdminView] = useState<'products' | 'submissions'>('products');
  const [loginError, setLoginError] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminProductListItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  /** Product deletes span Firestore, a catalog republish and R2 cleanup, so
      the dialogs stay locked until the whole sequence settles. */
  const [deletePending, setDeletePending] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(() => new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const mobileSelectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return observeAdminAuth((user) => setAuthenticated(Boolean(user)));
  }, []);

  /** Re-adopt the server list after a `router.refresh()` re-publishes it. */
  useEffect(() => setProducts(initialProducts), [initialProducts]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !normalized || product.name.toLowerCase().includes(normalized) || product.slug.includes(normalized) || product.sku.toLowerCase().includes(normalized);
      return matchesSearch && (category === 'all' || product.category === category);
    });
  }, [products, query, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const paginationEntries = getPaginationEntries(page, pages);
  const visibleSelectedCount = visible.filter((product) => selectedSlugs.has(product.slug)).length;
  const allVisibleSelected = visible.length > 0 && visibleSelectedCount === visible.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  useEffect(() => setPage(1), [query, category]);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
    if (mobileSelectAllRef.current) mobileSelectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const toggleProduct = (slug: string, checked: boolean) => {
    setSelectedSlugs((current) => {
      const next = new Set(current);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  };

  const toggleVisibleProducts = (checked: boolean) => {
    setSelectedSlugs((current) => {
      const next = new Set(current);
      visible.forEach((product) => {
        if (checked) next.add(product.slug);
        else next.delete(product.slug);
      });
      return next;
    });
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoginPending(true);
    try {
      await signInAdmin(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
      setLoginError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setLoginError(message.includes('network-request-failed')
        ? 'You appear to be offline. Reconnect and try signing in again.'
        : 'Email or password is incorrect, or this account does not have admin access.');
    } finally {
      setLoginPending(false);
    }
  };

  const logout = () => { void signOutAdmin(); };

  const openPasswordReset = () => {
    setResetError('');
    setResetSent(false);
    setResetOpen(true);
  };

  const closePasswordReset = () => {
    if (resetPending) return;
    setResetOpen(false);
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setResetPending(true);
    setResetError('');
    try {
      await sendAdminPasswordReset(String(data.get('resetEmail') ?? ''));
      setResetSent(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setResetError(message.includes('user-not-found')
        ? 'No administrator account exists with this email address.'
        : message.includes('network-request-failed')
          ? 'You appear to be offline. Reconnect and try again.'
          : message.includes('too-many-requests')
            ? 'Too many attempts. Please wait a little before trying again.'
            : 'We could not send the reset email. Please try again.');
    } finally {
      setResetPending(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || deletePending) return;
    setDeletePending(true);
    try {
      // Resolve first: deleting the product removes it from the snapshot the
      // image lookup reads, and the URLs would be unrecoverable afterwards.
      const imageUrls = await getProductImageUrls([deleting.slug]).catch(() => [deleting.imageUrl]);
      await deleteProductDocument(deleting.slug);
      await deleteManagedProductImages(imageUrls).catch(() => {
        setCatalogError('The product was deleted, but one or more R2 images require manual cleanup.');
      });
      setProducts((current) => current.filter((item) => item.slug !== deleting.slug));
      setSelectedSlugs((current) => {
        const next = new Set(current);
        next.delete(deleting.slug);
        return next;
      });
      setDeleting(null);
      router.refresh();
    } catch {
      setCatalogError('The product could not be deleted. Check your connection and try again.');
    } finally {
      setDeletePending(false);
    }
  };

  const confirmBulkDelete = async () => {
    const slugs = Array.from(selectedSlugs);
    if (deletePending) return;
    setDeletePending(true);
    try {
      // As above: resolve galleries while the products are still published.
      const imageUrls = await getProductImageUrls(slugs).catch(() => products
        .filter((product) => selectedSlugs.has(product.slug))
        .map((product) => product.imageUrl));
      await deleteProductDocuments(slugs);
      await deleteManagedProductImages(imageUrls).catch(() => {
        setCatalogError('The products were deleted, but one or more R2 images require manual cleanup.');
      });
      setProducts((current) => current.filter((product) => !selectedSlugs.has(product.slug)));
      setSelectedSlugs(new Set());
      setBulkDeleteOpen(false);
      router.refresh();
    } catch {
      setCatalogError('The selected products could not be deleted. Check your connection and try again.');
    } finally {
      setDeletePending(false);
    }
  };

  if (authenticated === null) return <div className="min-h-screen bg-slate-950" aria-label="Loading admin" />;

  if (!authenticated) {
    return (
      <>
      <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-slate-950 px-3 py-5 sm:px-4 sm:py-10">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(245,158,11,.25),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,.16),transparent_28%)]" />
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl sm:rounded-3xl lg:grid-cols-[1.05fr_.95fr]">
          <div className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-slate-950"><Package size={23} /></span><div><p className="font-display text-lg font-bold">Vital Admin</p><p className="text-xs text-slate-400">Catalog workspace</p></div></div>
            <div><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-amber-400">Simple catalog control</p><h1 className="max-w-sm text-4xl font-bold leading-tight text-white">Manage every product from one focused workspace.</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">Review the catalog, update product details, and keep every packaging style organized.</p></div>
            <p className="text-xs text-slate-500">UI prototype · Local persistence enabled</p>
          </div>
          <div className="p-5 sm:p-12">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-slate-950 lg:hidden"><Package size={23} /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-amber-600 sm:mt-8 lg:mt-0">Administrator access</p><h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to manage the product catalog.</p>
            <form onSubmit={login} className="mt-6 grid gap-4 sm:mt-8 sm:gap-5"><label className="grid min-w-0 gap-1.5 text-sm font-semibold text-ink-700">Email address<input name="email" type="email" defaultValue={ADMIN_EMAIL} autoComplete="username" required className={fieldClass} /></label><div className="grid min-w-0 gap-1.5"><div className="flex items-center justify-between gap-3"><label htmlFor="admin-password" className="text-sm font-semibold text-ink-700">Password</label><button type="button" onClick={openPasswordReset} className="text-xs font-bold text-amber-700 transition hover:text-amber-600 hover:underline">Forgot password?</button></div><input id="admin-password" name="password" type="password" autoComplete="current-password" required className={fieldClass} /></div>{loginError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{loginError}</p>}<button type="submit" disabled={loginPending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-70">{loginPending ? 'Signing in…' : 'Sign in securely'} <ShieldCheck size={18} /></button></form>
            <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-bold text-ink-700">Firebase authentication</p><p className="mt-1 text-slate-500">Sign in with the administrator account created in Firebase Authentication.</p></div>
          </div>
        </div>
      </div>
      <Modal open={resetOpen} onClose={closePasswordReset} title="Reset administrator password" className="sm:!max-w-[min(480px,calc(100vw-2rem))]">
        {resetSent ? (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><KeyRound size={25} /></span>
            <p role="status" className="mt-5 font-bold text-ink-900">Reset password email sent</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Check your email account and follow the secure link to choose a new password.</p>
            <button type="button" onClick={closePasswordReset} className="mt-6 h-11 w-full rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 hover:bg-amber-400">Back to sign in</button>
          </div>
        ) : (
          <form onSubmit={resetPassword}>
            <p className="text-sm leading-6 text-slate-600">Enter the email address connected to your administrator account.</p>
            <label className="mt-5 grid gap-1.5 text-sm font-semibold text-ink-700">Administrator email<input name="resetEmail" type="email" autoComplete="email" autoFocus required className={fieldClass} /></label>
            {resetError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{resetError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={closePasswordReset} disabled={resetPending} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-ink-700 disabled:opacity-60">Cancel</button><button type="submit" disabled={resetPending} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 disabled:cursor-wait disabled:opacity-70">{resetPending ? 'Checking…' : 'Send reset email'} <KeyRound size={17} /></button></div>
          </form>
        )}
      </Modal>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 text-white lg:flex" aria-label="Admin navigation">
        <div className="flex items-center gap-3 px-2 py-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-slate-950"><Package size={21} /></span><div><p className="font-display font-bold">Vital Admin</p><p className="text-xs text-slate-400">Management console</p></div></div>
        <nav className="mt-7 grid gap-2">
          <button onClick={() => setAdminView('products')} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${adminView === 'products' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Package size={18} /> Products</button>
          <button onClick={() => setAdminView('submissions')} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${adminView === 'submissions' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><ClipboardList size={18} /> Form submissions</button>
        </nav>
        <button onClick={logout} className="mt-auto flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white"><LogOut size={18} /> Sign out</button>
      </aside>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:h-20 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-slate-950"><Package size={21} /></span>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="min-w-0"><p className="font-display text-lg font-bold">{adminView === 'products' ? 'Products' : 'Submissions'}</p><p className="hidden text-xs text-slate-500 sm:block">{adminView === 'products' ? 'Manage your product catalog' : 'Review customer form requests'}</p></div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Open profile menu" className="group !h-11 !gap-2.5 !rounded-xl border border-slate-200 bg-white !px-1.5 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 sm:!h-12 sm:!px-2.5">
                <Avatar className="!h-9 !w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-slate-950 text-white"><UserRound size={18} /></AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 flex-1 flex-col items-start justify-center gap-1 text-left leading-none sm:flex"><span className="block text-sm font-bold leading-none text-ink-900">Vital Admin</span><span className="block text-xs font-normal leading-none text-slate-400">Administrator</span></span>
                <ChevronDown size={16} className="ml-0.5 hidden shrink-0 self-center transition group-data-[state=open]:rotate-180 sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-64 rounded-xl p-1.5">
              <DropdownMenuLabel className="flex items-center gap-2.5 px-2.5 py-2 font-normal">
                <Avatar className="!h-9 !w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-slate-950 font-display text-xs font-bold text-white">VA</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-5 text-ink-900">Vital Admin</span>
                  <span className="block truncate text-[11px] leading-4 text-slate-500">{ADMIN_EMAIL}</span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onSelect={logout} className="h-10 rounded-lg px-2.5 font-semibold text-red-600 focus:bg-red-50 focus:text-red-700">
                <LogOut size={16} /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="w-full overflow-x-hidden p-3 pb-28 sm:p-8 sm:pb-28 lg:p-10 lg:pb-28">
          <nav className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1 lg:hidden" aria-label="Admin navigation"><button onClick={() => setAdminView('products')} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${adminView === 'products' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-600'}`}><Package size={17} /> Products</button><button onClick={() => setAdminView('submissions')} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${adminView === 'submissions' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-600'}`}><ClipboardList size={17} /> Forms</button></nav>
          {adminView === 'submissions' ? <AdminLeadInbox /> : <>
          {catalogError && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{catalogError}</div>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"><div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1 sm:p-5"><p className="text-sm font-semibold text-slate-500">Total products</p><p className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{products.length}</p><p className="mt-1 text-xs text-emerald-600">Catalog loaded</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-sm font-semibold text-slate-500">Categories</p><p className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{categories.length}</p><p className="mt-1 truncate text-xs text-slate-400">Active groups</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-sm font-semibold text-slate-500">With SKU</p><p className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">{products.filter((product) => product.sku).length}</p><p className="mt-1 truncate text-xs text-slate-400">Inventory refs</p></div></div>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-display text-lg font-bold">Product catalog</h2><p className="text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? 'product' : 'products'} shown</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="sr-only">Search products</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className={`${fieldClass} pl-9 sm:w-64`} placeholder="Search products..." /></label><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className={`${fieldClass} sm:w-56`}><option value="all">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div></div>
            {selectedSlugs.size > 0 && (
              <div className="flex flex-col items-stretch gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                <p className="text-sm font-semibold text-amber-900">{selectedSlugs.size} {selectedSlugs.size === 1 ? 'product' : 'products'} selected</p>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSlugs(new Set())} className="!h-8 !px-3 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900">Clear</Button>
                  <Button variant="ghost" size="sm" onClick={() => setBulkDeleteOpen(true)} iconLeft={<Trash2 size={15} />} className="!h-8 !px-3 text-xs text-red-600 hover:bg-red-100 hover:text-red-700">Delete selected</Button>
                </div>
              </div>
            )}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-slate-50 text-[11px] uppercase tracking-wider">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="w-14 px-5">
                      <Checkbox ref={selectAllRef} checked={allVisibleSelected} onChange={(event) => toggleVisibleProducts(event.target.checked)} label={<span className="sr-only">Select all products on this page</span>} containerClassName="min-h-0 gap-0" />
                    </TableHead>
                    <TableHead className="px-5">Product</TableHead>
                    <TableHead className="px-5">Category</TableHead>
                    <TableHead className="px-5">SKU</TableHead>
                    <TableHead className="px-5">Status</TableHead>
                    <TableHead className="px-5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((product) => (
                    <TableRow key={product.slug} data-state={selectedSlugs.has(product.slug) ? 'selected' : undefined}>
                      <TableCell className="w-14 px-5 py-4"><Checkbox checked={selectedSlugs.has(product.slug)} onChange={(event) => toggleProduct(product.slug, event.target.checked)} label={<span className="sr-only">Select {product.name}</span>} containerClassName="min-h-0 gap-0" /></TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-slate-50"><Image src={product.imageUrl} alt="" fill sizes="48px" unoptimized={product.imageUrl.startsWith('data:')} className="object-cover" /></div><div className="min-w-0"><p className="max-w-xs truncate font-bold">{product.name}</p><p className="max-w-xs truncate text-xs text-slate-400">{product.slug}</p></div></div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">{product.categoryName}</TableCell>
                      <TableCell className="px-5 py-4 text-slate-500">{product.sku || '—'}</TableCell>
                      <TableCell className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span></TableCell>
                      <TableCell className="px-5 py-4"><div className="flex justify-end gap-1"><button aria-label={`Edit ${product.name}`} onClick={() => router.push(`/admin/products/${encodeURIComponent(product.slug)}/edit`)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Edit3 size={17} /></button><button aria-label={`Delete ${product.name}`} onClick={() => setDeleting(product)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-b border-slate-100 px-4 py-3 md:hidden"><Checkbox ref={mobileSelectAllRef} checked={allVisibleSelected} onChange={(event) => toggleVisibleProducts(event.target.checked)} label={<span className="text-sm font-semibold text-slate-600">Select this page</span>} containerClassName="min-h-0" /></div>
            <div className="divide-y divide-slate-100 md:hidden">{visible.map((product) => <article key={product.slug} className={`p-4 transition-colors ${selectedSlugs.has(product.slug) ? 'bg-amber-50/70' : ''}`}><div className="flex min-w-0 items-start gap-3"><Checkbox checked={selectedSlugs.has(product.slug)} onChange={(event) => toggleProduct(product.slug, event.target.checked)} label={<span className="sr-only">Select {product.name}</span>} containerClassName="mt-3 min-h-0 gap-0" /><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-slate-50"><Image src={product.imageUrl} alt="" fill sizes="56px" unoptimized={product.imageUrl.startsWith('data:')} className="object-cover" /></div><div className="min-w-0 flex-1 pt-0.5"><p className="line-clamp-2 text-sm font-bold leading-5">{product.name}</p><p className="mt-1 truncate text-xs text-slate-400">{product.categoryName}</p><p className="mt-1 truncate text-[11px] text-slate-400">{product.sku || product.slug}</p></div></div><div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2"><button aria-label={`Edit ${product.name}`} onClick={() => router.push(`/admin/products/${encodeURIComponent(product.slug)}/edit`)} className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600"><Edit3 size={17} /> Edit</button><button aria-label={`Delete ${product.name}`} onClick={() => setDeleting(product)} className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={17} /> Delete</button></div></article>)}</div>
            {visible.length === 0 && <div className="px-5 py-16 text-center"><Search className="mx-auto text-slate-300" size={32} /><p className="mt-3 font-bold">No products found</p></div>}
            <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-center text-xs text-slate-500 sm:text-left">Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <Pagination className="mx-0 w-auto justify-center sm:justify-end">
                <PaginationContent>
                  <PaginationItem><PaginationPrevious disabled={page === 1} onClick={() => setPage((value) => value - 1)} /></PaginationItem>
                  {paginationEntries.map((entry) => entry === 'start-ellipsis' || entry === 'end-ellipsis' ? (
                    <PaginationItem key={entry} className="hidden sm:block"><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={entry} className={entry !== page && pages > 5 ? 'hidden sm:block' : undefined}>
                      <PaginationLink isActive={entry === page} aria-label={`Go to page ${entry}`} onClick={() => setPage(entry)}>{entry}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext disabled={page === pages} onClick={() => setPage((value) => value + 1)} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </section>
          <p className="mt-4 text-center text-xs text-slate-400">Showing the published catalog. Unfinished form drafts stay safely on this device.</p>
          </>}
      </main>
      {adminView === 'products' && <button aria-label="Add product" onClick={() => router.push('/admin/products/new')} className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 font-bold text-slate-950 shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200 sm:bottom-7 sm:right-8 sm:px-5"><CirclePlus size={21} /><span className="hidden sm:inline">Add product</span></button>}
      <Modal open={bulkDeleteOpen} onClose={() => { if (!deletePending) setBulkDeleteOpen(false); }} title="Delete selected products">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4"><p className="text-sm font-bold text-red-800">{selectedSlugs.size} {selectedSlugs.size === 1 ? 'product will' : 'products will'} be removed</p><p className="mt-1 text-xs leading-5 text-red-700">This permanently removes the selected records from Firebase.</p></div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" size="sm" disabled={deletePending} onClick={() => setBulkDeleteOpen(false)} className="w-full sm:w-auto">Cancel</Button><Button size="sm" disabled={deletePending} onClick={() => { void confirmBulkDelete(); }} className="w-full gap-2 bg-red-600 text-white hover:bg-red-500 hover:text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto">{deletePending && <LoaderCircle size={15} className="animate-spin" />}{deletePending ? 'Deleting…' : `Delete ${selectedSlugs.size} ${selectedSlugs.size === 1 ? 'product' : 'products'}`}</Button></div>
      </Modal>
      <Modal open={deleting !== null} onClose={() => { if (!deletePending) setDeleting(null); }} title="Delete product"><p className="break-words text-sm leading-6 text-slate-600">Are you sure you want to delete <strong>{deleting?.name}</strong>? This permanently removes its Firebase record.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={deletePending} onClick={() => setDeleting(null)} className="h-11 w-full rounded-lg border px-5 text-sm font-semibold disabled:opacity-50 sm:w-auto">Cancel</button><button type="button" disabled={deletePending} onClick={() => { void confirmDelete(); }} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto">{deletePending && <LoaderCircle size={15} className="animate-spin" />}{deletePending ? 'Deleting…' : 'Delete product'}</button></div></Modal>
    </div>
  );
}
