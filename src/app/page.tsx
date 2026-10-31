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
  | { status: 'ready'; items: CatalogItem[] };

function CoverImage({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-4xl font-bold text-neutral-700">
        {label.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={label}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(src)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function ItemCard({ item, metro, country }: { item: CatalogItem; metro: Metro; country: Country }) {
  const router = useRouter();
  const href = `/item/${encodeURIComponent(item.id)}?t=${item.table}`;
  const price = computeOnRoad(item, metro, country);
  const specs = topSpecs(item.specs, 3);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onMouseEnter={() => router.prefetch(href)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e0e] transition-all hover:border-amber-500/50 shadow-2xl"
    >
      <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
        <CoverImage src={item.thumbnail ?? item.gallery[0] ?? null} label={item.brand || item.modelName} />
        {item.brand && (
          <span className="absolute left-3 top-3 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider border border-white/10 backdrop-blur-md">
            {item.brand}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-lg bg-amber-500 text-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
          {metro.name}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="truncate text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            {item.modelName}
          </h3>
          {item.tier && <p className="text-xs text-neutral-400">{item.tier}</p>}
        </div>

        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Est. on-road in {metro.name}</p>
          <p className="text-2xl font-black text-amber-400 mt-0.5">
            {price ? formatMoney(price.total, country) : 'Price on request'}
          </p>
        </div>

        {specs.length > 0 && (
          <dl className="grid grid-cols-3 gap-2 border-t border-neutral-800/80 pt-3 text-center">
            {specs.map((s) => (
              <div key={s.key} className="min-w-0 bg-neutral-950 p-2 rounded-xl border border-neutral-800/60">
                <dt className="truncate text-[10px] text-neutral-400 uppercase">{s.label}</dt>
                <dd className="truncate text-xs font-semibold text-neutral-200 mt-0.5">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

function Catalog() {
  const params = useSearchParams();
  const { metro, country } = useRegion();
  const rawCat = params.get('cat');
  const cat = isCategoryKey(rawCat) ? rawCat : 'supercars';
  const category = CATEGORIES.find((c) => c.key === cat)!;

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          const { data } = await supabase.from(table).select('*').limit(300);
          return { table, rows: (data ?? []) as RawRow[] };
        }),
      );
      if (cancelled) return;
      const items = results.flatMap((r) => r.rows.map((row) => normalizeItem(row, r.table))).filter((i) => i.id);
      setState({ status: 'ready', items });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (state.status !== 'ready') return [];
    return state.items.filter((i) => i.category === cat);
  }, [state, cat]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black uppercase text-white tracking-tight">{category.label}</h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-400">
          {category.blurb}. Showing estimated on-road prices for <strong>{metro.name} ({country.name})</strong> in {country.currency}.
        </p>
      </div>

      {state.status === 'loading' && (
        <div className="text-center py-20 text-neutral-500 uppercase tracking-widest text-xs">
          Loading Vault Registry...
        </div>
      )}

      {state.status === 'ready' && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center text-sm text-neutral-500">
          No {category.label.toLowerCase()} listed in this registry yet.
        </div>
      )}

      {state.status === 'ready' && visible.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="h-40 bg-[#050505]" />}>
        <Catalog />
      </Suspense>
    </div>
  );
}
