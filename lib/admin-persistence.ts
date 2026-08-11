'use client';

import type { AdminProduct } from '@/lib/admin-product';

const DATABASE_NAME = 'vital-admin';
const DATABASE_VERSION = 1;
const DRAFT_STORE = 'product-drafts';
const CATALOG_STORE = 'catalog-overrides';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DRAFT_STORE)) database.createObjectStore(DRAFT_STORE);
      if (!database.objectStoreNames.contains(CATALOG_STORE)) database.createObjectStore(CATALOG_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readValue<T>(storeName: string, key: string): Promise<T | null> {
  if (typeof indexedDB === 'undefined') {
    const value = localStorage.getItem(`${storeName}:${key}`);
    return value ? JSON.parse(value) as T : null;
  }
  const database = await openDatabase();
  return new Promise<T | null>((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

async function writeValue<T>(storeName: string, key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    localStorage.setItem(`${storeName}:${key}`, JSON.stringify(value));
    return;
  }
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

async function removeValue(storeName: string, key: string): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    localStorage.removeItem(`${storeName}:${key}`);
    return;
  }
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export const getProductDraft = (key: string) => readValue<AdminProduct>(DRAFT_STORE, key);
export const saveProductDraft = (key: string, product: AdminProduct) => writeValue(DRAFT_STORE, key, product);
export const clearProductDraft = (key: string) => removeValue(DRAFT_STORE, key);

export interface CatalogOverride {
  originalSlug: string;
  product: AdminProduct;
}

export async function saveCatalogOverride(product: AdminProduct, originalSlug: string) {
  await writeValue<CatalogOverride>(CATALOG_STORE, originalSlug, { originalSlug, product });
}

export async function getCatalogOverrides(): Promise<CatalogOverride[]> {
  if (typeof indexedDB === 'undefined') {
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => Boolean(key?.startsWith(`${CATALOG_STORE}:`)))
      .map((key) => JSON.parse(localStorage.getItem(key) ?? 'null') as CatalogOverride)
      .filter(Boolean);
  }
  const database = await openDatabase();
  return new Promise<CatalogOverride[]>((resolve, reject) => {
    const request = database.transaction(CATALOG_STORE, 'readonly').objectStore(CATALOG_STORE).getAll();
    request.onsuccess = () => resolve(request.result as CatalogOverride[]);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
