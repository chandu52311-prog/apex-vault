'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  CATEGORIES,
  COUNTRIES,
  COUNTRY_INDEX,
  TABLES,
  isCategoryKey,
  pct,
  useRegion,
  type CategoryKey,
  type CountryId,
  type Table,
} from '@/lib/locations';

/* ------------------------------------------------------------------ */
/*  Search box (used here and on the detail page)                      */
/* ------------------------------------------------------------------ */

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
  const [active, setActive] = useState(-1);
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
        if (!cancelled) {
          setHits(groups.flat());
          setActive(-1);
        }
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && hits[active]) return go(hits[active]);
      if (mode === 'jump') {
        if (hits[0]) go(hits[0]);
        return;
      }
      setOpen(false);
      onSubmitQuery?.(q.trim());
    }
  };

  const showPanel = open && cleanTerm(q).length >= 2;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <label className="sr-only" htmlFor={`search-${mode}`}>
        Search the vault
      </label>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b919b]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <input
        id={`search-${mode}`}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={mode === 'jump' ? 'Jump to another model' : 'Search brand or model'}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={`search-list-${mode}`}
        className="h-10 w-full rounded-lg border border-[#262b33] bg-[#14171c] pl-9 pr-3 text-sm text-[#e9e6df] placeholder:text-[#6b717b] outline-none transition focus:border-[#c9a96e] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/30"
      />
      {showPanel && (
        <ul
          id={`search-list-${mode}`}
          role="listbox"
          className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-auto rounded-lg border border-[#262b33] bg-[#14171c] p-1 shadow-2xl shadow-black/60"
        >
          {loading && hits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[#8b919b]">Searching…</li>
          ) : null}
          {!loading && hits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[#8b919b]">No models match “{q.trim()}”.</li>
          ) : null}
          {hits.map((h, i) => (
            <li key={`${h.table}:${h.id}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left ${
                  i === active ? 'bg-[#1d2128]' : ''
                }`}
              >
                <span className="h-10 w-14 shrink-0 overflow-hidden rounded bg-[#0d0f12]">
                  {h.thumb && (
                    <img src={h.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-[#e9e6df]">{h.name}</span>
                  <span className="block truncate text-xs text-[#8b919b]">{h.brand}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  City selector: country first, then metro                           */
/* ------------------------------------------------------------------ */

export function CitySelect({ className = '' }: { className?: string }) {
  const { metro, country, setMetro } = useRegion();
  const [open, setOpen] = useState(false);
  const [pickCountry, setPickCountry] = useState<CountryId>(country.id);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setPickCountry(country.id);
  }, [open, country.id]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const shown = COUNTRY_INDEX[pickCountry];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-lg border border-[#262b33] bg-[#14171c] px-3 text-sm text-[#e9e6df] outline-none transition hover:border-[#3a414c] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 text-[#c9a96e]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
          <circle cx="10" cy="8" r="2.2" />
        </svg>
        <span className="max-w-[9rem] truncate">{metro.name}</span>
        <span className="rounded bg-[#1d2128] px-1.5 py-0.5 text-xs text-[#c9a96e]">{country.symbol.trim()}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose your city"
          className="absolute right-0 top-12 z-50 w-[min(92vw,22rem)] rounded-xl border border-[#262b33] bg-[#14171c] p-3 shadow-2xl shadow-black/60"
        >
          <div className="mb-3 grid grid-cols-4 gap-1 rounded-lg bg-[#0d0f12] p-1">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPickCountry(c.id)}
                aria-pressed={c.id === pickCountry}
                className={`rounded-md py-1.5 text-sm transition ${
                  c.id === pickCountry ? 'bg-[#1d2128] text-[#c9a96e]' : 'text-[#8b919b] hover:text-[#e9e6df]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="mb-1 px-1 text-xs text-[#8b919b]">
            Prices in {shown.currency} · {shown.taxLabel}
          </p>
          <ul>
            {shown.metros.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMetro(m.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition hover:bg-[#1d2128] ${
                    m.id === metro.id ? 'text-[#c9a96e]' : 'text-[#e9e6df]'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-xs tabular-nums text-[#8b919b]">{pct(m.taxRate)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <Link href="/" className="shrink-0 text-lg font-semibold tracking-[0.18em] text-[#e9e6df]">
      APEX<span className="text-[#c9a96e]">VAULT</span>
    </Link>
  );
}

function NavbarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawCat = params.get('cat');
  const cat: CategoryKey = isCategoryKey(rawCat) ? rawCat : 'supercars';
  const q = params.get('q') ?? '';

  const navigate = (next: { cat?: CategoryKey; q?: string }) => {
    const sp = new URLSearchParams();
    sp.set('cat', next.cat ?? cat);
    const nq = next.q ?? q;
    if (nq) sp.set('q', nq);
    router.push(`/?${sp.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#262b33] bg-[#0d0f12]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Logo />
        <SearchBox
          key={q}
          initial={q}
          onSubmitQuery={(value) => navigate({ q: value })}
          className="order-3 w-full sm:order-none sm:ml-2 sm:w-auto sm:flex-1 sm:max-w-md"
        />
        <CitySelect className="ml-auto" />
      </div>
      <nav aria-label="Categories" className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
        <ul className="flex gap-6">
          {CATEGORIES.map((c) => {
            const on = c.key === cat;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => navigate({ cat: c.key })}
                  aria-current={on ? 'page' : undefined}
                  className={`relative whitespace-nowrap py-3 text-sm outline-none transition focus-visible:text-[#c9a96e] ${
                    on ? 'text-[#e9e6df]' : 'text-[#8b919b] hover:text-[#e9e6df]'
                  }`}
                >
                  {c.label}
                  {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#c9a96e]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 border-b border-[#262b33] bg-[#0d0f12]">
          <div className="mx-auto flex h-[6.25rem] max-w-7xl items-start px-4 py-3 sm:px-6">
            <Logo />
          </div>
        </header>
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
