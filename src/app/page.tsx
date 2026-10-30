'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import {
  CATEGORIES,
  TABLES,
  computeOnRoad,
  formatMoney,
  isCategoryKey,
  normalizeItem,
  topSpecs,
  useRegion,
  type CatalogItem,
  type Country,
  type Metro,
  type RawRow,
} from '@/lib/locations';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: CatalogItem[]; warning: string | null };

function CoverImage({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1d2128] to-[#0d0f12] text-4xl font-semibold text-[#3a414c]">
        {label.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(src)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
    />
  );
}

function ItemCard({ item, metro, country }: { item: CatalogItem; metro: Metro; country: Country }) {
  const router = useRouter();
  const href = `/item/${encodeURIComponent(item.id)}?t=${item.table}`;
  const price = computeOnRoad(item, metro);
  const specs = topSpecs(item.specs, 3);
  const open = () => router.push(href);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${item.brand} ${item.modelName}`}
      onClick={open}
      onMouseEnter={() => router.prefetch(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-[#262b33] bg-[#14171c] outline-none transition hover:border-[#c9a96e]/60 focus-visible:border-[#c9a96e] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0f12]">
        <CoverImage src={item.thumbnail ?? item.gallery[0] ?? null} label={item.brand || item.modelName} />
        {item.brand && (
          <span className="absolute left-3 top-3 rounded-md bg-[#0d0f12]/85 px-2.5 py-1 text-xs font-medium text-[#e9e6df] backdrop-blur">
            {item.brand}
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="truncate text-lg font-semibold tracking-tight text-[#e9e6df]">{item.modelName}</h3>
          {item.tier && <p className="text-sm text-[#8b919b]">{item.tier}</p>}
        </div>

        <div>
          <p className="text-xs text-[#8b919b]">Est. on-road, {metro.name}</p>
          <p className="text-xl font-semibold tabular-nums text-[#c9a96e]">
            {price ? formatMoney(price.total, country) : 'Price on request'}
          </p>
        </div>

        {specs.length > 0 && (
          <dl className="grid grid-cols-3 gap-2 border-t border-[#262b33] pt-3">
            {specs.map((s) => (
              <div key={s.key} className="min-w-0">
                <dt className="truncate text-[11px] text-[#8b919b]">{s.label}</dt>
                <dd className="truncate text-sm text-[#e9e6df]" title={s.value}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading vault">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#262b33] bg-[#14171c]">
          <div className="aspect-[16/10] animate-pulse bg-[#1d2128]" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-[#1d2128]" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-[#1d2128]" />
            <div className="h-10 animate-pulse rounded bg-[#1d2128]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Catalog() {
  const params = useSearchParams();
  const { metro, country } = useRegion();
  const rawCat = params.get('cat');
  const cat = isCategoryKey(rawCat) ? rawCat : 'supercars';
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const category = CATEGORIES.find((c) => c.key === cat)!;

  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          const { data, error } = await supabase.from(table).select('*').limit(300);
          return { table, rows: (data ?? []) as RawRow[], error: error?.message ?? null };
        }),
      );
      if (cancelled) return;
      const failed = results.filter((r) => r.error);
      if (failed.length === results.length) {
        setState({ status: 'error', message: failed[0].error ?? 'Unable to reach the vault.' });
        return;
      }
      const items = results.flatMap((r) => r.rows.map((row) => normalizeItem(row, r.table))).filter((i) => i.id);
      setState({
        status: 'ready',
        items,
        warning: failed.length ? `Could not load: ${failed.map((f) => f.table).join(', ')}.` : null,
      });
    })().catch((e: unknown) => {
      if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Network error.' });
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const visible = useMemo(() => {
    if (state.status !== 'ready') return [];
    return state.items
      .filter((i) => i.category === cat)
      .filter((i) => !q || `${i.brand} ${i.modelName} ${i.tier}`.toLowerCase().includes(q))
      .map((i) => ({ item: i, total: computeOnRoad(i, metro)?.total ?? -1 }))
      .sort((a, b) => b.total - a.total)
      .map((x) => x.item);
  }, [state, cat, q, metro]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#e9e6df]">{category.label}</h1>
        <p className="mt-1 text-sm text-[#8b919b]">
          {category.blurb}. Prices shown as estimated on-road for {metro.name} in {country.currency}.
          {q && <> Filtered by &ldquo;{q}&rdquo;.</>}
        </p>
      </div>

      {state.status === 'ready' && state.warning && (
        <p role="status" className="mb-4 rounded-lg border border-[#5a4a2a] bg-[#1d1a12] px-3 py-2 text-sm text-[#c9a96e]">
          {state.warning}
        </p>
      )}

      {state.status === 'loading' && <SkeletonGrid />}

      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-[#262b33] bg-[#14171c] p-8 text-center">
          <p className="text-[#e9e6df]">The vault could not be loaded.</p>
          <p className="mt-1 text-sm text-[#8b919b]">{state.message}</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="mt-4 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-[#0d0f12] outline-none hover:bg-[#d8bb84] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#262b33] p-10 text-center text-sm text-[#8b919b]">
          {q ? `No ${category.label.toLowerCase()} match “${q}”. Clear the search or try another category.` : `No ${category.label.toLowerCase()} listed yet.`}
        </div>
      )}

      {state.status === 'ready' && visible.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <ItemCard key={`${item.table}:${item.id}`} item={item} metro={metro} country={country} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e9e6df]">
      <Navbar />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><SkeletonGrid /></div>}>
        <Catalog />
      </Suspense>
    </div>
  );
}
