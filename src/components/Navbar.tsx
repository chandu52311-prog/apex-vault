'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  CATEGORIES,
  COUNTRIES,
  TABLES,
  isCategoryKey,
  useRegion,
  type CategoryKey,
  type Table,
} from '@/lib/locations';

interface Hit {
  id: string;
  table: Table;
  brand: string;
  name: string;
  thumb: string | null;
}

const cleanTerm = (s: string) => s.replace(/[,()%*\\"']/g, ' ').replace(/\s+/g, ' ').trim();
const hitHref = (h: Hit) => `/item/${encodeURIComponent(h.id)}?t=${h.table}`;

export function SearchBox({
  mode = 'filter',
  initial = '',
  onSubmitQuery,
  className = '',
}: {
  mode?: 'filter' | 'jump';
  initial?: string;
  onSubmitQuery?: (q: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = cleanTerm(q);
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const groups = await Promise.all(
          TABLES.map(async (table) => {
            const { data, error } = await supabase
              .from(table)
              .select('id, brand, model_name, thumbnail_url')
              .or(`model_name.ilike.%${term}%,brand.ilike.%${term}%`)
              .limit(4);
            if (error || !data) return [] as Hit[];
            return (data as Record<string, unknown>[]).map((r) => ({
              id: String(r.id),
              table,
              brand: String(r.brand ?? ''),
              name: String(r.model_name ?? ''),
              thumb: typeof r.thumbnail_url === 'string' ? r.thumbnail_url : null,
            }));
          }),
        );
        if (!cancelled) setHits(groups.flat());
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (h: Hit) => {
    setOpen(false);
    setQ('');
    router.push(hitHref(h));
  };

  const showPanel = open && cleanTerm(q).length >= 2;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Quick Search Supercars, Bikes, Gadgets..."
        className="h-10 w-full rounded-xl border border-neutral-800 bg-[#121212] px-4 text-xs text-white placeholder-neutral-500 outline-none transition focus:border-amber-500"
      />
      {showPanel && (
        <ul className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-auto rounded-xl border border-neutral-800 bg-[#121212] p-1 shadow-2xl">
          {loading && hits.length === 0 ? <li className="px-3 py-3 text-xs text-neutral-400">Searching Vault...</li> : null}
          {!loading && hits.length === 0 ? <li className="px-3 py-3 text-xs text-neutral-500">No models found.</li> : null}
          {hits.map((h) => (
            <li key={`${h.table}:${h.id}`}>
              <button
                type="button"
                onClick={() => go(h)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
              >
                <span className="h-9 w-12 shrink-0 overflow-hidden rounded bg-neutral-900">
                  {h.thumb && <img src={h.thumb} alt="" className="h-full w-full object-cover" />}
                </span>
                <div>
                  <span className="block text-xs font-bold text-white">{h.name}</span>
                  <span className="block text-[10px] text-amber-500 uppercase">{h.brand}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function GlobalLocationSelector({ className = '' }: { className?: string }) {
  const { country, metro, selectCountry, selectMetro } = useRegion();
  const tier1List = COUNTRIES.filter((c) => c.isTier1);
  const restList = COUNTRIES.filter((c) => !c.isTier1);

  return (
    <div className={`flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs ${className}`}>
      <select
        value={country.id}
        onChange={(e) => selectCountry(e.target.value)}
        className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
      >
        <optgroup label="🌟 TIER-1 LUXURY MARKETS" className="bg-neutral-900 text-amber-400 font-bold">
          {tier1List.map((c) => (
            <option key={c.id} value={c.id} className="bg-neutral-900 text-white font-normal">
              {c.name} ({c.currency})
            </option>
          ))}
        </optgroup>
        <optgroup label="🌍 ALL 180+ GLOBAL TERRITORIES" className="bg-neutral-900 text-neutral-400 font-bold">
          {restList.map((c) => (
            <option key={c.id} value={c.id} className="bg-neutral-900 text-white font-normal">
              {c.name} ({c.currency})
            </option>
          ))}
        </optgroup>
      </select>

      <span className="text-neutral-700">/</span>

      <select
        value={metro.id}
        onChange={(e) => selectMetro(e.target.value)}
        className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
      >
        {country.metros.map((m) => (
          <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export const CitySelect = GlobalLocationSelector;

function NavbarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawCat = params.get('cat');
  const cat: CategoryKey = isCategoryKey(rawCat) ? rawCat : 'supercars';

  return (
    <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer self-start md:self-auto">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-lg flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
            A
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">
              APEX<span className="text-amber-500">VAULT</span>
            </span>
            <span className="block text-[10px] text-neutral-400 tracking-widest uppercase">
              195-Nation Verified Registry
            </span>
          </div>
        </Link>

        <SearchBox className="w-full md:w-80" />
        <GlobalLocationSelector />
      </div>

      <div className="border-t border-neutral-900 mt-3 pt-2 flex justify-center space-x-2 overflow-x-auto">
        {CATEGORIES.map((c) => {
          const isActive = c.key === cat;
          return (
            <button
              key={c.key}
              onClick={() => router.push(`/?cat=${c.key}`)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-20 bg-[#080808] border-b border-neutral-800" />}>
      <NavbarInner />
    </Suspense>
  );
}
