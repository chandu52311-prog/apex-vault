'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CitySelect, SearchBox } from '@/components/Navbar';
import {
  ALL_METROS,
  COUNTRIES,
  COUNTRY_INDEX,
  TABLES,
  computeOnRoad,
  formatMoney,
  isVehicle,
  normalizeItem,
  pct,
  useRegion,
  type CatalogItem,
  type Country,
  type RawRow,
  type Table,
} from '@/lib/locations';

/* ------------------------------------------------------------------ */
/*  Data Fetching                                                      */
/* ------------------------------------------------------------------ */

async function fetchItem(id: string, hint: Table | null): Promise<{ item: CatalogItem | null; error: string | null }> {
  const order = hint ? [hint, ...TABLES.filter((t) => t !== hint)] : TABLES;
  let errors = 0;
  let lastError: string | null = null;
  for (const table of order) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    if (error) {
      errors += 1;
      lastError = error.message;
      continue;
    }
    if (data) return { item: normalizeItem(data as RawRow, table), error: null };
  }
  return { item: null, error: errors === order.length ? lastError : null };
}

/* ------------------------------------------------------------------ */
/*  Affiliate URLs                                                     */
/* ------------------------------------------------------------------ */

const AMAZON_DOMAIN: Record<string, string> = { IN: 'amazon.in', US: 'amazon.com', AE: 'amazon.ae', GB: 'amazon.co.uk' };

function amazonLink(item: CatalogItem, country: Country) {
  if (item.amazonUrl) return item.amazonUrl;
  return `https://www.${AMAZON_DOMAIN[country.id] || 'amazon.com'}/s?k=${encodeURIComponent(`${item.brand} ${item.modelName}`)}`;
}

function storeLink(item: CatalogItem, country: Country) {
  const q = encodeURIComponent(`${item.brand} ${item.modelName}`);
  return country.id === 'IN'
    ? `https://www.croma.com/searchB?q=${q}`
    : `https://www.google.com/search?q=${q}+official+store`;
}

function insuranceLink(item: CatalogItem, country: Country) {
  const override = process.env.NEXT_PUBLIC_INSURANCE_AFFILIATE_URL;
  if (override) return override;
  if (country.id === 'IN') {
    return item.category === 'superbikes'
      ? 'https://www.policybazaar.com/two-wheeler-insurance/'
      : 'https://www.policybazaar.com/motor-insurance/';
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`zero depreciation insurance ${item.brand} ${item.modelName} ${country.name}`)}`;
}

/* ------------------------------------------------------------------ */
/*  Gallery Component                                                  */
/* ------------------------------------------------------------------ */

function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const stripRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const safe = Math.min(index, Math.max(count - 1, 0));
  const current = images[safe];

  useEffect(() => {
    if (images[safe + 1]) new Image().src = images[safe + 1];
    if (images[safe - 1]) new Image().src = images[safe - 1];
    const btn = stripRef.current?.querySelector<HTMLElement>(`[data-idx="${safe}"]`);
    btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [safe, images]);

  const step = (d: number) => setIndex((i) => (i + d + count) % count);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-[#262b33] bg-[#14171c] text-sm text-[#8b919b]">
        Photos for this model are coming soon.
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }}
      aria-label={`${alt} photo gallery`}
      className="space-y-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#262b33] bg-[#0d0f12]">
        {failed.has(current) ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8b919b]">This photo failed to load.</div>
        ) : (
          <img
            key={current}
            src={current}
            alt={`${alt}, photo ${safe + 1} of ${count}`}
            decoding="async"
            onError={() => setFailed((s) => new Set(s).add(current))}
            className="h-full w-full object-cover"
          />
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#0d0f12]/80 text-[#e9e6df] backdrop-blur outline-none hover:bg-[#0d0f12] focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m12 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#0d0f12]/80 text-[#e9e6df] backdrop-blur outline-none hover:bg-[#0d0f12] focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m8 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-[#0d0f12]/80 px-2 py-1 text-xs tabular-nums text-[#e9e6df] backdrop-blur">
              {safe + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              data-idx={i}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === safe}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 bg-[#0d0f12] outline-none transition focus-visible:ring-2 focus-visible:ring-[#c9a96e] ${
                i === safe ? 'border-[#c9a96e]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lead Modal                                                         */
/* ------------------------------------------------------------------ */

function LeadModal({ item, defaultCity, onClose }: { item: CatalogItem; defaultCity: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const modelLabel = `${item.brand} ${item.modelName}`.trim();

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/[\s+\-()]/g, '');
    if (name.trim().length < 2) return setMessage('Enter your full name.');
    if (!/^\d{7,15}$/.test(digits)) return setMessage('Enter a valid phone number, 7 to 15 digits.');
    setMessage(null);
    setStatus('sending');
    const { error } = await supabase.from('leads').insert({
      name: name.trim(),
      phone: phone.trim(),
      city,
      model: modelLabel,
      item_id: item.id,
      item_table: item.table,
    });
    if (error) {
      setStatus('error');
      setMessage('We could not save your request. Please try again in a moment.');
    } else {
      setStatus('done');
    }
  };

  const field =
    'h-11 w-full rounded-lg border border-[#262b33] bg-[#0d0f12] px-3 text-sm text-[#e9e6df] outline-none transition focus:border-[#c9a96e] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/30';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="lead-title" className="w-full max-w-md rounded-2xl border border-[#262b33] bg-[#14171c] p-6 shadow-2xl">
        {status === 'done' ? (
          <div className="space-y-4 text-center">
            <h2 id="lead-title" className="text-lg font-semibold text-[#e9e6df]">Request received</h2>
            <p className="text-sm text-[#8b919b]">
              A specialist in {city} will call {name.trim()} about the {modelLabel}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#c9a96e] px-5 py-2.5 text-sm font-medium text-[#0d0f12] outline-none hover:bg-[#d8bb84] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="flex items-start justify-between gap-4">
              <h2 id="lead-title" className="text-lg font-semibold text-[#e9e6df]">
                {item.category === 'superbikes' ? 'Book a test ride' : 'Book a dealership consultation'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-[#8b919b] outline-none hover:text-[#e9e6df] focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <label className="block space-y-1.5 text-sm text-[#8b919b]">
              Full name
              <input ref={firstRef} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
            </label>
            <label className="block space-y-1.5 text-sm text-[#8b919b]">
              Phone number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className={field} />
            </label>
            <label className="block space-y-1.5 text-sm text-[#8b919b]">
              City
              <select value={city} onChange={(e) => setCity(e.target.value)} className={field}>
                {ALL_METROS.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm text-[#8b919b]">
              Model
              <input value={modelLabel} readOnly className={`${field} text-[#8b919b]`} />
            </label>

            {message && <p role="alert" className="text-sm text-[#e0836b]">{message}</p>}
            {status === 'error' && item.testDriveUrl && (
              <a href={item.testDriveUrl} target="_blank" rel="noopener noreferrer sponsored" className="block text-sm text-[#c9a96e] underline">
                Book directly with our dealership partner instead
              </a>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="h-11 w-full rounded-lg bg-[#c9a96e] text-sm font-medium text-[#0d0f12] outline-none transition hover:bg-[#d8bb84] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Request a call back'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail View                                                        */
/* ------------------------------------------------------------------ */

function ItemView() {
  const rawParams = useParams<{ id: string }>();
  const search = useSearchParams();
  const { metro, country, setMetro } = useRegion();
  const [leadOpen, setLeadOpen] = useState(false);

  const id = useMemo(() => {
    const raw = Array.isArray(rawParams.id) ? rawParams.id[0] : rawParams.id;
    try {
      return decodeURIComponent(raw ?? '');
    } catch {
      return raw ?? '';
    }
  }, [rawParams.id]);

  const t = search.get('t');
  const hint: Table | null = TABLES.includes(t as Table) ? (t as Table) : null;
  const key = `${id}|${hint ?? ''}`;

  const [res, setRes] = useState<{ key: string; item: CatalogItem | null; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchItem(id, hint)
      .then((r) => !cancelled && setRes({ key, ...r }))
      .catch((e: unknown) => !cancelled && setRes({ key, item: null, error: e instanceof Error ? e.message : 'Network error.' }));
    return () => {
      cancelled = true;
    };
  }, [id, hint, key]);

  const current = res && res.key === key ? res : null;
  const item = current?.item ?? null;

  useEffect(() => {
    if (item) document.title = `${item.brand} ${item.modelName} | APEXVAULT`;
  }, [item]);

  const vehicle = item ? isVehicle(item.category) : false;
  const price = item ? computeOnRoad(item, metro) : null;

  const header = (
    <header className="sticky top-0 z-40 border-b border-[#262b33] bg-[#0d0f12]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href={item ? `/?cat=${item.category}` : '/'}
          className="flex h-10 items-center gap-2 rounded-lg border border-[#262b33] bg-[#14171c] px-3 text-sm text-[#e9e6df] outline-none transition hover:border-[#3a414c] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40"
        >
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m12 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vault Registry
        </Link>
        <SearchBox mode="jump" className="order-3 w-full sm:order-none sm:flex-1 sm:max-w-md" />
        <CitySelect className="ml-auto" />
      </div>
    </header>
  );

  let body: React.ReactNode;

  if (!current) {
    body = (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading machine">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-[#14171c]" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-[#14171c]" />
            <div className="h-64 animate-pulse rounded-xl bg-[#14171c]" />
          </div>
        </div>
      </div>
    );
  } else if (!item) {
    body = (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-[#e9e6df]">{current.error ? 'This machine could not be loaded' : 'Machine not found'}</h1>
        <p className="mt-2 text-sm text-[#8b919b]">
          {current.error ?? 'It may have been removed from the vault. Search for another model or return to the registry.'}
        </p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-[#c9a96e] px-5 py-2.5 text-sm font-medium text-[#0d0f12] outline-none hover:bg-[#d8bb84] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50">
          Back to Vault Registry
        </Link>
      </div>
    );
  } else {
    const title = `${item.brand} ${item.modelName}`.trim();
    const rows: { label: string; value: string; strong?: boolean }[] = price
      ? [
          { label: vehicle ? 'Ex-showroom price' : 'Retail price before tax', value: formatMoney(price.base, country) },
          { label: `${vehicle ? 'RTO & registration cess' : 'Local tax & duty'} (${pct(price.taxRate)})`, value: formatMoney(price.tax, country) },
          ...(vehicle ? [{ label: `Zero-dep insurance (${pct(price.insuranceRate)})`, value: formatMoney(price.insurance, country) }] : []),
        ]
      : [];

    body = (
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <Gallery key={`${item.table}:${item.id}`} images={item.gallery} alt={title} />

          <div className="space-y-6 lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-[#8b919b]">
                {item.brand}
                {item.tier && ` · ${item.tier}`}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#e9e6df]">{item.modelName}</h1>
            </div>

            {/* Valuation */}
            <section aria-labelledby="val-title" className="rounded-xl border border-[#262b33] bg-[#14171c] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id="val-title" className="text-sm font-medium text-[#e9e6df]">On-road valuation</h2>
                <select
                  value={metro.id}
                  onChange={(e) => setMetro(e.target.value)}
                  aria-label="Valuation city"
                  className="h-9 max-w-[11rem] rounded-lg border border-[#262b33] bg-[#0d0f12] px-2 text-sm text-[#e9e6df] outline-none focus:border-[#c9a96e] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/30"
                >
                  {COUNTRIES.map((c) => (
                    <optgroup key={c.id} label={c.name}>
                      {c.metros.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {price ? (
                <>
                  <dl className="mt-4 space-y-2 text-sm">
                    {rows.map((r) => (
                      <div key={r.label} className="flex justify-between gap-4">
                        <dt className="text-[#8b919b]">{r.label}</dt>
                        <dd className="tabular-nums text-[#e9e6df]">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[#262b33] pt-4">
                    <span className="text-sm text-[#8b919b]">{vehicle ? `Estimated on-road, ${metro.name}` : `Estimated price, ${metro.name}`}</span>
                    <span className="text-2xl font-semibold tabular-nums text-[#c9a96e]">{formatMoney(price.total, country)}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#6b717b]">
                    Estimate only. Final figures are confirmed by the dealer or retailer{country.id !== 'IN' && item.baseUsd == null ? ' and converted from the INR list price' : ''}.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm text-[#8b919b]">Pricing for this model is available on request.</p>
              )}
            </section>

            {/* Monetisation */}
            {vehicle ? (
              <section aria-label="Book and insure" className="space-y-3">
                <button
                  type="button"
                  onClick={() => setLeadOpen(true)}
                  className="h-12 w-full rounded-lg bg-[#c9a96e] text-sm font-medium text-[#0d0f12] outline-none transition hover:bg-[#d8bb84] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50"
                >
                  {item.category === 'superbikes' ? 'Book Dealership Consultation / Test Ride' : 'Book Dealership Consultation / Test Drive'}
                </button>
                <a
                  href={insuranceLink(item, country)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-[#3a414c] text-sm text-[#e9e6df] outline-none transition hover:border-[#c9a96e] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40"
                >
                  Compare Zero-Dep Insurance Deals
                </a>
              </section>
            ) : (
              <section aria-label="Where to buy" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <a
                  href={amazonLink(item, country)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-xl border border-[#c9a96e]/60 bg-[#14171c] p-4 outline-none transition hover:bg-[#1d2128] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50"
                >
                  <span className="block text-sm font-medium text-[#e9e6df]">Buy on Amazon</span>
                  <span className="mt-1 block text-xs text-[#8b919b]">Verified best price</span>
                </a>
                <a
                  href={storeLink(item, country)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-xl border border-[#262b33] bg-[#14171c] p-4 outline-none transition hover:border-[#3a414c] hover:bg-[#1d2128] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50"
                >
                  <span className="block text-sm font-medium text-[#e9e6df]">Check Croma / Official Store Deal</span>
                  <span className="mt-1 block text-xs text-[#8b919b]">{country.id === 'IN' ? 'Croma listing' : 'Brand store listing'}</span>
                </a>
              </section>
            )}
          </div>
        </div>

        {/* Pricing Matrix */}
        <section aria-labelledby="matrix-title">
          <h2 id="matrix-title" className="text-xl font-semibold tracking-tight text-[#e9e6df]">Global pricing matrix</h2>
          <p className="mt-1 text-sm text-[#8b919b]">
            Estimated {vehicle ? 'on-road' : 'final'} price in every supported city, in local currency. Select a row to switch city.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#262b33]">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead className="bg-[#14171c] text-[#8b919b]">
                <tr>
                  <th scope="col" className="sticky left-0 bg-[#14171c] px-4 py-3 font-medium">City</th>
                  <th scope="col" className="px-4 py-3 font-medium">Country</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{vehicle ? 'Ex-showroom' : 'Base price'}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{vehicle ? 'RTO & cess' : 'Tax'}</th>
                  {vehicle && <th scope="col" className="px-4 py-3 text-right font-medium">Zero-dep insurance</th>}
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {ALL_METROS.map((m) => {
                  const c = COUNTRY_INDEX[m.countryId];
                  const p = computeOnRoad(item, m);
                  const on = m.id === metro.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setMetro(m.id)}
                      className={`cursor-pointer border-t border-[#262b33] transition hover:bg-[#1d2128] ${on ? 'bg-[#1d2128]' : 'bg-[#0d0f12]'}`}
                    >
                      <th scope="row" className={`sticky left-0 px-4 py-3 text-left font-normal ${on ? 'bg-[#1d2128] text-[#c9a96e]' : 'bg-[#0d0f12] text-[#e9e6df]'}`}>
                        <button type="button" onClick={() => setMetro(m.id)} className="text-left outline-none focus-visible:underline">
                          {m.name}
                        </button>
                        <span className="ml-2 text-xs text-[#6b717b]">{pct(m.taxRate)}</span>
                      </th>
                      <td className="px-4 py-3 text-[#8b919b]">{c.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#e9e6df]">{p ? formatMoney(p.base, c) : '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#e9e6df]">{p ? formatMoney(p.tax, c) : '—'}</td>
                      {vehicle && <td className="px-4 py-3 text-right tabular-nums text-[#e9e6df]">{p ? formatMoney(p.insurance, c) : '—'}</td>}
                      <td className={`px-4 py-3 text-right font-medium tabular-nums ${on ? 'text-[#c9a96e]' : 'text-[#e9e6df]'}`}>{p ? formatMoney(p.total, c) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Specs */}
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-xl font-semibold tracking-tight text-[#e9e6df]">Technical registry</h2>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-[#262b33] bg-[#262b33] sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: '__brand', label: 'Brand', value: item.brand },
              { key: '__tier', label: 'Tier', value: item.tier },
              ...item.specs,
            ]
              .filter((s) => s.value)
              .map((s) => (
                <div key={s.key} className="bg-[#14171c] p-4">
                  <dt className="text-xs text-[#8b919b]">{s.label}</dt>
                  <dd className="mt-1 break-words text-base text-[#e9e6df]">{s.value}</dd>
                </div>
              ))}
          </dl>
          {item.specs.length === 0 && <p className="mt-3 text-sm text-[#8b919b]">Detailed specifications have not been published for this model yet.</p>}
        </section>

        {leadOpen && <LeadModal item={item} defaultCity={metro.name} onClose={() => setLeadOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e9e6df]">
      {header}
      {body}
    </div>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f12]" />}>
      <ItemView />
    </Suspense>
  );
}
