'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Force dynamic execution for Next.js build
export const dynamic = 'force-dynamic';

// --- SUPABASE CLIENT ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ColorOption {
  name: string;
  hex: string;
  image?: string;
  cities?: string[];
}

interface ProductItem {
  id: string;
  table: 'cars' | 'bikes' | 'gadgets';
  brand: string;
  model_name: string;
  year?: number;
  tier?: string;
  body_type?: string;
  fuel_type?: string;
  category?: string;
  engine_displacement?: string;
  max_power?: string;
  zero_to_hundred_kmh?: number;
  top_speed_kmh?: number;
  base_price_usd?: number;
  ex_showroom_inr: number;
  thumbnail_url: string;
  gallery?: string[];
  colors?: ColorOption[];
}

interface RegionConfig {
  name: string;
  currency: string;
  rate: number;
  symbol: string;
  vatRate: number;
  regFee: number;
  cities: string[];
}

const REGION_REGISTRY: Record<string, RegionConfig> = {
  IN: {
    name: 'India',
    currency: 'INR',
    rate: 1,
    symbol: '₹',
    vatRate: 0.28,
    regFee: 0.12,
    cities: ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Chennai'],
  },
  US: {
    name: 'United States',
    currency: 'USD',
    rate: 0.012,
    symbol: '$',
    vatRate: 0.07,
    regFee: 0.03,
    cities: ['New York, NY', 'Los Angeles, CA', 'Miami, FL'],
  },
  AE: {
    name: 'United Arab Emirates',
    currency: 'AED',
    rate: 0.044,
    symbol: 'AED ',
    vatRate: 0.05,
    regFee: 0.02,
    cities: ['Dubai', 'Abu Dhabi'],
  },
  GB: {
    name: 'United Kingdom',
    currency: 'GBP',
    rate: 0.0095,
    symbol: '£',
    vatRate: 0.20,
    regFee: 0.05,
    cities: ['London', 'Manchester'],
  },
};

const ANGLE_LABELS = [
  'Front 3/4 Dynamic',
  'Rear Aero & Diffuser',
  'Side Profile Stance',
  'Driver Cockpit & Steering',
  'Cabin & Bucket Seats',
  'Instrument Cluster & Details',
];

function ItemDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = (params?.id as string) || '';
  const tableParam = searchParams.get('t') as 'cars' | 'bikes' | 'gadgets' | null;

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedRegion, setSelectedRegion] = useState<string>('IN');
  const [selectedCity, setSelectedCity] = useState<string>('Hyderabad');

  // Initialized safely with empty strings to avoid undefined crashes during prerendering
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeLabel, setActiveLabel] = useState<string>('');
  const [selectedColorHex, setSelectedColorHex] = useState<string>('');

  const [selectedRam, setSelectedRam] = useState<number>(32);
  const [selectedSsd, setSelectedSsd] = useState<number>(1000);

  const [showModal, setShowModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setErrorMsg('');

      const searchTables = tableParam ? [tableParam] : (['cars', 'bikes', 'gadgets'] as const);
      let found: ProductItem | null = null;

      for (const t of searchTables) {
        const { data, error } = await supabase
          .from(t)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          found = { ...data, table: t };
          break;
        }
      }

      if (isCancelled) return;

      if (found) {
        setProduct(found);
        const initialImg = found.colors?.[0]?.image || found.thumbnail_url || '';
        setActiveImage(initialImg);
        setActiveLabel(found.colors?.[0]?.name || 'Factory Finish');
        setSelectedColorHex(found.colors?.[0]?.hex || '');
      } else {
        setErrorMsg('Specification not found in Apex Vault Registry.');
      }
      setLoading(false);
    }

    loadItem();
    return () => {
      isCancelled = true;
    };
  }, [id, tableParam]);

  const safeGallery = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.thumbnail_url) list.push(product.thumbnail_url);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }
    return list.slice(0, 6);
  }, [product]);

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColorHex(color.hex);
    setActiveLabel(color.name);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  const handleThumbnailClick = (imgUrl: string, idx: number) => {
    setActiveImage(imgUrl);
    const matched = product?.colors?.find((c) => c.image === imgUrl);
    if (matched) {
      setActiveLabel(matched.name);
      setSelectedColorHex(matched.hex);
    } else {
      setActiveLabel(ANGLE_LABELS[idx] || `Angle ${idx + 1}`);
      setSelectedColorHex('');
    }
  };

  const region = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['IN'];

  const dynamicPricing = useMemo(() => {
    if (!product) return { base: 0, tax: 0, total: 0 };
    let baseInr = Number(product.ex_showroom_inr) || 0;

    if (product.table === 'gadgets') {
      if (selectedRam === 64) baseInr += 40000;
      if (selectedRam === 128) baseInr += 90000;
      if (selectedSsd === 2000) baseInr += 30000;
      if (selectedSsd === 4000) baseInr += 80000;
    }

    const convertedBase = baseInr * region.rate;
    const tax = convertedBase * (region.vatRate + region.regFee);
    const total = convertedBase + tax;

    return {
      base: convertedBase,
      tax,
      total,
    };
  }, [product, region, selectedRam, selectedSsd]);

  const stockNotice = useMemo(() => {
    if (!product) return '';
    const currentFinish = product.colors?.find((c) => c.hex === selectedColorHex);
    if (!currentFinish || !currentFinish.cities || currentFinish.cities.length === 0) {
      return `Allocation open for immediate dispatch to ${selectedCity}`;
    }
    if (currentFinish.cities.includes(selectedCity)) {
      return `In Stock: Ready for immediate allocation in ${selectedCity}`;
    }
    const hasAnyInCountry = currentFinish.cities.some((c) => region.cities.includes(c));
    if (hasAnyInCountry) {
      return `Transit Required: Dispatches in 2-3 days to ${selectedCity}`;
    }
    return `Regional Import Required for ${region.name}`;
  }, [product, selectedColorHex, selectedCity, region]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone || !product) return;
    setLeadSubmitting(true);

    try {
      await supabase.from('leads').insert([
        {
          name: leadForm.name,
          phone: leadForm.phone,
          city: selectedCity,
          model: `${product.brand} ${product.model_name}`,
          item_id: product.id,
          item_table: product.table,
          color: activeLabel,
        },
      ]);
      setLeadSubmitted(true);
    } catch {
      setLeadSubmitted(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-amber-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs font-semibold tracking-widest uppercase">Loading Registry Blueprint...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
        <h2 className="text-xl font-bold tracking-wider uppercase text-neutral-400">Registry Error</h2>
        <p className="mt-2 text-sm text-neutral-500">{errorMsg || 'Item unavailable'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-400 transition hover:bg-amber-500 hover:text-black"
        >
          Return to Vault
        </button>
      </div>
    );
  }

  const isAutomotive = product.table === 'cars' || product.table === 'bikes';

  return (
    <main className="min-h-screen bg-black text-neutral-100 selection:bg-amber-500 selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-400 transition hover:text-amber-400"
          >
            &larr; Back to Vault
          </Link>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => {
                const newReg = e.target.value;
                setSelectedRegion(newReg);
                setSelectedCity(REGION_REGISTRY[newReg].cities[0]);
              }}
              className="rounded-md border border-white/15 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-200 outline-none focus:border-amber-400"
            >
              {Object.entries(REGION_REGISTRY).map(([code, r]) => (
                <option key={code} value={code}>
                  {r.name} ({r.currency})
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-md border border-white/15 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-200 outline-none focus:border-amber-400"
            >
              {region.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* SHOWCASE */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-amber-400">
                  {product.brand}
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">
                  {product.tier || product.category || product.table}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl">
                {product.model_name}
              </h1>
            </div>

            {/* HERO IMAGE CONTAINER: Uses HTML img tag to avoid domain blocking */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${product.brand} ${product.model_name}`}
                  className="h-full w-full object-cover object-center transition-all duration-500 ease-out"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-neutral-600 uppercase">
                  Asset In Verification
                </div>
              )}

              <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                <p className="text-xs font-medium tracking-wide text-amber-400">
                  {activeLabel}
                </p>
              </div>
            </div>

            {/* FINISHES */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-neutral-900/50 p-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Official Bespoke Finishes
                  </span>
                  <p className="text-sm font-semibold text-white">{activeLabel}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c, i) => {
                    const isSelected = selectedColorHex === c.hex;
                    return (
                      <button
                        key={`${c.name}-${i}`}
                        onClick={() => handleColorSelect(c)}
                        title={c.name}
                        className={`h-7 w-7 rounded-full border-2 transition-all duration-300 ${
                          isSelected
                            ? 'scale-110 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* THUMBNAILS: HTML img tags */}
            {safeGallery.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                    Studio Angles &amp; Verified Views
                  </p>
                  <span className="text-[11px] text-neutral-500">
                    {safeGallery.length} High-Res Frames
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {safeGallery.map((url, idx) => {
                    const isSelected = activeImage === url;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleThumbnailClick(url, idx)}
                        className={`group relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-neutral-900 transition-all duration-300 ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${product.model_name} frame ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SPECS */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Technical Registry &amp; Specifications
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {isAutomotive ? (
                  <>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Power Output</span>
                      <p className="mt-1 text-base font-bold text-white">{product.max_power || 'N/A'}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Top Velocity</span>
                      <p className="mt-1 text-base font-bold text-white">
                        {product.top_speed_kmh ? `${product.top_speed_kmh} km/h` : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">0-100 km/h</span>
                      <p className="mt-1 text-base font-bold text-white">
                        {product.zero_to_hundred_kmh ? `${product.zero_to_hundred_kmh}s` : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Displacement</span>
                      <p className="mt-1 text-base font-bold text-white">{product.engine_displacement || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Architecture</span>
                      <p className="mt-1 text-base font-bold text-white">{product.category || 'Workstation'}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Performance</span>
                      <p className="mt-1 text-base font-bold text-white">{product.max_power || 'Silicon'}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Configured RAM</span>
                      <p className="mt-1 text-base font-bold text-white">{selectedRam} GB Unified</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Storage</span>
                      <p className="mt-1 text-base font-bold text-white">{selectedSsd} GB NVMe</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* VALUATION CARD */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md shadow-2xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  {isAutomotive ? `Live On-Road Price in ${selectedCity}` : `Direct Retail Price (${region.name})`}
                </span>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400 sm:text-4xl">
                    {region.symbol}
                    {dynamicPricing.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {stockNotice}
                </div>

                <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>Ex-Factory / Retail Base:</span>
                    <span className="font-medium text-white">
                      {region.symbol}
                      {dynamicPricing.base.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Regional Duties &amp; Taxes:</span>
                    <span className="font-medium text-white">
                      {region.symbol}
                      {dynamicPricing.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {product.table === 'gadgets' && (
                  <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Memory</span>
                      <div className="mt-2 flex gap-2">
                        {[16, 32, 64].map((ram) => (
                          <button
                            key={ram}
                            onClick={() => setSelectedRam(ram)}
                            className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                              selectedRam === ram
                                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                                : 'border-white/10 text-neutral-400 hover:border-white/25'
                            }`}
                          >
                            {ram} GB
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Solid State Drive</span>
                      <div className="mt-2 flex gap-2">
                        {[512, 1000, 2000].map((ssd) => (
                          <button
                            key={ssd}
                            onClick={() => setSelectedSsd(ssd)}
                            className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                              selectedSsd === ssd
                                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                                : 'border-white/10 text-neutral-400 hover:border-white/25'
                            }`}
                          >
                            {ssd >= 1000 ? `${ssd / 1000} TB` : `${ssd} GB`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  {isAutomotive ? (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full rounded-xl bg-amber-400 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 active:scale-[0.98]"
                    >
                      Book VIP Test Drive in {selectedCity}
                    </button>
                  ) : (
                    <a
                      href="https://amazon.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-xl bg-amber-400 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 active:scale-[0.98]"
                    >
                      Check Deal on Amazon
                    </a>
                  )}
                </div>

                <p className="mt-3 text-center text-[10px] text-neutral-500">
                  Connected Dealership: Authorized {product.brand} Hub ({selectedCity})
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                VIP Concierge Allocation
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setLeadSubmitted(false);
                }}
                className="text-neutral-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {leadSubmitted ? (
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  &#10003;
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">Request Dispatched</h4>
                <p className="mt-1 text-xs text-neutral-400">
                  The Authorized {product.brand} Specialist in {selectedCity} will contact you shortly regarding the {activeLabel} allocation.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 w-full rounded-lg bg-amber-400 py-2.5 text-xs font-bold uppercase tracking-wider text-black"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chandu"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contact Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-neutral-400">
                  Vehicle: <span className="text-white font-medium">{product.brand} {product.model_name}</span>
                  <br />
                  Selected Finish: <span className="text-amber-400 font-medium">{activeLabel}</span>
                  <br />
                  Hub: <span className="text-white font-medium">{selectedCity}</span>
                </div>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full rounded-lg bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {leadSubmitting ? 'Routing to Hub...' : 'Confirm Allocation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-amber-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <ItemDetailContent />
    </Suspense>
  );
}
