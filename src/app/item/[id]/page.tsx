'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// 5 Dedicated Modular Data Architecture Imports
import { REGION_REGISTRY, RegionConfig } from '@/data/regions';
import { AFFILIATE_CONFIG } from '@/data/affiliates';
import { calculateMonthlyEMI } from '@/data/finance';
import { SECURITY_PACKAGES } from '@/data/securityPackages';
import { getDealerWhatsAppUrl } from '@/data/dealerships';

// Google AdSense Compliance Footer
import Footer from '@/components/Footer';

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
  price_usd?: number;
  current_price_usd?: number;
  ex_showroom_inr?: number;
  current_price_inr?: number;
  price?: number;
  retail_price?: number;
  thumbnail_url: string;
  gallery?: string[];
  colors?: ColorOption[];
  specs?: Record<string, any>;
  amazon_affiliate_url?: string;
  flipkart_affiliate_url?: string;
}

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

  // 1. Default Location set to US / New York
  const [selectedRegion, setSelectedRegion] = useState<string>('US');
  const [selectedCity, setSelectedCity] = useState<string>('New York, NY');

  const [activeImage, setActiveImage] = useState<string>('');
  const [activeLabel, setActiveLabel] = useState<string>('');
  const [selectedColorHex, setSelectedColorHex] = useState<string>('');

  const [selectedRam, setSelectedRam] = useState<number>(16);
  const [selectedSsd, setSelectedSsd] = useState<number>(512);

  // Security Armor Package Selection State
  const [selectedSecurityPkg, setSelectedSecurityPkg] = useState<string>(
    SECURITY_PACKAGES && SECURITY_PACKAGES.length > 0 ? SECURITY_PACKAGES[0].id : ''
  );

  const [showModal, setShowModal] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<'booking' | 'test-drive' | 'insurance' | 'security' | null>(null);
  const [leadForm, setLeadForm] = useState({ name: '', countryCode: '+1', phone: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // 2. IP Geolocation Auto-Detection with US / New York Fallback
  useEffect(() => {
    async function detectUserLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        const userCountry = data.country_code;
        const userCity = data.city;

        if (userCountry && REGION_REGISTRY[userCountry]) {
          setSelectedRegion(userCountry);

          const availableCities = REGION_REGISTRY[userCountry].cities || [];
          const matchedCity = availableCities.find(
            (c) => c.toLowerCase() === (userCity || '').toLowerCase()
          );

          setSelectedCity(matchedCity || availableCities[0] || 'New York, NY');
        }
      } catch (err) {
        // Fallback default safe ga US / New York untundi
      }
    }

    detectUserLocation();
  }, []);

  // 3. Region fallback bound to US
  const region = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['US'] || {
    name: 'United States',
    currency: 'USD',
    rate: 0.012,
    symbol: '$',
    vatRate: 0.07,
    regFee: 0.03,
    dialCode: '+1',
    cities: ['New York, NY'],
  };

  useEffect(() => {
    setLeadForm((prev) => ({ ...prev, countryCode: region.dialCode || '+1' }));
  }, [selectedRegion, region.dialCode]);

  // 4. Product Loader (Supabase Data Fetching)
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
        
        const initialImg = 
          found.colors?.[0]?.image || 
          (found.gallery && found.gallery.length > 0 ? found.gallery[0] : found.thumbnail_url) || 
          '';
          
        setActiveImage(initialImg);
        setActiveLabel(found.colors?.[0]?.name || 'Factory Finish');
        setSelectedColorHex(found.colors?.[0]?.hex || '');

        if (found.table === 'gadgets') {
          const availRams = found.specs?.available_rams || [16, 32];
          const availSsds = found.specs?.available_ssds || [512, 1000];
          setSelectedRam(availRams[0] || 16);
          setSelectedSsd(availSsds[0] || 512);
        }
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

  const region = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['IN'] || {
    name: 'India',
    currency: 'INR',
    rate: 1,
    symbol: '₹',
    vatRate: 0.28,
    regFee: 0.12,
    dialCode: '+91',
    cities: ['Hyderabad'],
  };

  useEffect(() => {
    setLeadForm((prev) => ({ ...prev, countryCode: region.dialCode || '+91' }));
  }, [selectedRegion, region.dialCode]);

  // Variant availability matrix (Gadgets)
  const availableRams: number[] = useMemo(() => {
    if (product?.specs?.available_rams && Array.isArray(product.specs.available_rams)) {
      return product.specs.available_rams;
    }
    return [16, 32, 64];
  }, [product]);

  const availableSsds: number[] = useMemo(() => {
    if (product?.specs?.available_ssds && Array.isArray(product.specs.available_ssds)) {
      return product.specs.available_ssds;
    }
    return [512, 1000, 2000];
  }, [product]);

  const safeGallery = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (product.thumbnail_url && !list.includes(product.thumbnail_url)) {
      list.push(product.thumbnail_url);
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
      setActiveLabel(ANGLE_LABELS[idx] || `Frame ${idx + 1}`);
      setSelectedColorHex('');
    }
  };

  // Dynamic Pricing + Modular EMI Calculation
  const dynamicPricing = useMemo(() => {
    if (!product) return { base: 0, tax: 0, total: 0, emiMonthly: 0 };

    let baseInr = Number(
      product.current_price_inr ?? 
      product.ex_showroom_inr ?? 
      product.retail_price ?? 
      product.price ?? 
      0
    );

    if (product.table === 'gadgets') {
      if (selectedRam === 32) baseInr += 30000;
      if (selectedRam === 64) baseInr += 70000;
      if (selectedSsd === 1000) baseInr += 20000;
      if (selectedSsd === 2000) baseInr += 50000;
    }

    const convertedBase = baseInr * region.rate;
    const tax = convertedBase * (region.vatRate + region.regFee);
    const total = convertedBase + tax;

    // Monthly EMI from dedicated finance file
    const emiMonthly = calculateMonthlyEMI(total);

    return {
      base: convertedBase,
      tax,
      total,
      emiMonthly,
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
    const hasAnyInCountry = currentFinish.cities.some((c) => region.cities && region.cities.includes(c));
    if (hasAnyInCountry) {
      return `Transit Required: Dispatches in 2-3 days to ${selectedCity}`;
    }
    return `Regional Import Required for ${region.name}`;
  }, [product, selectedColorHex, selectedCity, region]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone || !product) return;
    setLeadSubmitting(true);

    const fullPhone = `${leadForm.countryCode} ${leadForm.phone}`;

    try {
      await supabase.from('leads').insert([
        {
          name: leadForm.name,
          phone: fullPhone,
          city: selectedCity,
          model: `${product.brand} ${product.model_name}`,
          item_id: product.id,
          item_table: product.table,
          color: activeLabel,
          workflow_type: activeWorkflow,
          security_package: activeWorkflow === 'security' ? selectedSecurityPkg : null,
        },
      ]);
      setLeadSubmitted(true);
    } catch {
      setLeadSubmitted(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const isAutomotive = product?.table === 'cars' || product?.table === 'bikes';

  // Instant Dealership WhatsApp Concierge Trigger
  const triggerWhatsAppConcierge = () => {
    if (!product) return;
    const url = getDealerWhatsAppUrl(selectedCity, product.brand, product.model_name, activeLabel);
    window.open(url, '_blank');
  };

  const openFullscreen = () => {
    if (!isAutomotive) return;
    const currentIdx = safeGallery.indexOf(activeImage);
    setFullscreenIndex(currentIdx >= 0 ? currentIdx : 0);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => setIsFullscreen(false);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenIndex((prev) => (prev === 0 ? safeGallery.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenIndex((prev) => (prev === safeGallery.length - 1 ? 0 : prev + 1));
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

  return (
    <main 
      className="min-h-screen bg-black text-neutral-100 selection:bg-amber-500 selection:text-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-400 transition hover:text-amber-400 animate-pulse"
          >
            &larr; Back to Vault
          </Link>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => {
                const newReg = e.target.value;
                setSelectedRegion(newReg);
                const nextRegObj = REGION_REGISTRY[newReg];
                setSelectedCity(nextRegObj?.cities?.[0] || '');
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
              {(region.cities || []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

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

            <div 
              onClick={openFullscreen}
              className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl ${isAutomotive ? 'cursor-zoom-in hover:brightness-110' : ''}`}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${product.brand} ${product.model_name}`}
                  className="h-full w-full object-cover object-center transition-all duration-500 ease-out select-none"
                  draggable="false"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-neutral-600 uppercase">
                  Asset In Verification
                </div>
              )}

              {isAutomotive && (
                <div className="absolute top-4 right-4 rounded-lg bg-black/65 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
                  🔍 Tap Screen For Full view
                </div>
              )}

              <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                <p className="text-xs font-medium tracking-wide text-amber-400 select-none">
                  {activeLabel}
                </p>
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-neutral-900/50 p-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 select-none">
                    Official Bespoke Finishes
                  </span>
                  <p className="text-sm font-semibold text-white select-none">{activeLabel}</p>
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

            {safeGallery.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 select-none">
                    Studio Angles &amp; Verified Views
                  </p>
                  <span className="text-[11px] text-neutral-500 select-none">
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
                          className="h-full w-full object-cover select-none"
                          draggable="false"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                      <p className="mt-1 text-base font-bold text-white">{product.specs?.processor || product.category || 'Apple M-Series Silicon'}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Display Engine</span>
                      <p className="mt-1 text-base font-bold text-white">{product.specs?.display || 'Liquid Retina XDR'}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Selected RAM</span>
                      <p className="mt-1 text-base font-bold text-white">{selectedRam} GB Unified</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Storage</span>
                      <p className="mt-1 text-base font-bold text-white">{selectedSsd >= 1000 ? `${selectedSsd / 1000} TB` : `${selectedSsd} GB`}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md shadow-2xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 select-none">
                  {isAutomotive ? `Live On-Road Price in ${selectedCity}` : `Direct Retail Price (${region.name})`}
                </span>
                
                <div className="mt-2 flex items-baseline gap-2 select-none">
                  <span className="text-3xl font-black text-amber-400 sm:text-4xl">
                    {region.symbol}
                    {dynamicPricing.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Modular EMI Breakdown */}
                {isAutomotive && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs">
                    <span className="text-neutral-400">Estimated Vault EMI:</span>
                    <span className="font-bold text-amber-400">
                      {region.symbol}{dynamicPricing.emiMonthly.toLocaleString()}/mo
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400 select-none">
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
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span>Estimated Regional Duties &amp; Taxes:</span>
                    <span className="font-medium text-white">
                      {region.symbol}
                      {dynamicPricing.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* GADGET DYNAMIC HARDWARE SELECTION */}
                {product.table === 'gadgets' && (
                  <div className="mt-6 space-y-4 pt-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Memory</span>
                      <div className="mt-2 flex gap-2">
                        {[16, 32, 64].map((ram) => {
                          const isAvailable = availableRams.includes(ram);
                          const isSelected = selectedRam === ram;
                          return (
                            <button
                              key={ram}
                              disabled={!isAvailable}
                              onClick={() => setSelectedRam(ram)}
                              className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                                !isAvailable
                                  ? 'cursor-not-allowed border-white/5 bg-neutral-900/30 text-neutral-600 line-through opacity-40'
                                  : isSelected
                                  ? 'border-amber-400 bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                                  : 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
                              }`}
                            >
                              {ram} GB
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Solid State Drive</span>
                      <div className="mt-2 flex gap-2">
                        {[512, 1000, 2000].map((ssd) => {
                          const isAvailable = availableSsds.includes(ssd);
                          const isSelected = selectedSsd === ssd;
                          return (
                            <button
                              key={ssd}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSsd(ssd)}
                              className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                                !isAvailable
                                  ? 'cursor-not-allowed border-white/5 bg-neutral-900/30 text-neutral-600 line-through opacity-40'
                                  : isSelected
                                  ? 'border-amber-400 bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30'
                                  : 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
                              }`}
                            >
                              {ssd >= 1000 ? `${ssd / 1000} TB` : `${ssd} GB`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* DYNAMIC ACTION GATEWAYS */}
                <div className="mt-6 space-y-2.5">
                  {isAutomotive ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveWorkflow('booking');
                          setShowModal(true);
                        }}
                        className="w-full rounded-xl bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 active:scale-[0.98]"
                      >
                        VIP Showroom Booking Allocation
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActiveWorkflow('test-drive');
                            setShowModal(true);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-neutral-200 transition hover:bg-white/10 active:scale-[0.98]"
                        >
                          Request Test Drive
                        </button>
                        <button
                          onClick={() => {
                            setActiveWorkflow('insurance');
                            setShowModal(true);
                          }}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 transition hover:bg-amber-500/15 active:scale-[0.98]"
                        >
                          Opt Luxury Insurance
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setActiveWorkflow('security');
                          setShowModal(true);
                        }}
                        className="w-full rounded-xl border border-amber-500/30 bg-amber-950/20 py-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 transition hover:bg-amber-900/30 active:scale-[0.98]"
                      >
                        VIP Security &amp; Anti-Theft Protection
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Dynamic Affiliate Network Integration */}
                      <a
                        href={product.amazon_affiliate_url || `https://amazon.in?tag=${AFFILIATE_CONFIG.amazonTag}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-xl bg-amber-400 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 active:scale-[0.98]"
                      >
                        Buy on Amazon (Official Store Deal) &rarr;
                      </a>

                      <a
                        href={product.flipkart_affiliate_url || `https://flipkart.com?affid=${AFFILIATE_CONFIG.flipkartTrackingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-neutral-900 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800 active:scale-[0.98]"
                      >
                        Buy on Flipkart (Card Deals) &rarr;
                      </a>
                    </>
                  )}
                </div>

                <p className="mt-4 text-center text-[9px] text-neutral-500 select-none">
                  Connected Dealership: Authorized {product.brand} Hub ({selectedCity})
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isFullscreen && isAutomotive && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4"
          onClick={closeFullscreen}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button 
            className="absolute top-6 right-6 text-2xl font-bold text-neutral-400 hover:text-white"
            onClick={closeFullscreen}
          >
            &times; Close view
          </button>

          <div className="relative max-h-[80vh] max-w-full overflow-hidden select-none" onClick={(e) => e.stopPropagation()}>
            <img 
              src={safeGallery[fullscreenIndex]} 
              alt="Apex Fullscreen View" 
              className="mx-auto max-h-[75vh] object-contain rounded-lg border border-white/5 shadow-2xl pointer-events-none select-none"
              draggable="false"
            />

            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/55 text-white text-2xl rounded-full hover:bg-black/75 transition border border-white/5"
            >
              &#10094;
            </button>

            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/55 text-white text-2xl rounded-full hover:bg-black/75 transition border border-white/5"
            >
              &#10095;
            </button>
          </div>

          <div className="mt-5 text-center pointer-events-none">
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
              {product?.brand} {product?.model_name}
            </p>
            <p className="text-[10px] text-amber-500/90 font-medium uppercase mt-1">
              Visual frame {fullscreenIndex + 1} of {safeGallery.length} • Screenshot protection is active
            </p>
          </div>
        </div>
      )}

      {/* OFFICIAL LUXURY MODAL WITH SECURITY TIER SELECTOR & WHATSAPP DESK */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {activeWorkflow === 'booking' && 'VIP Showroom Booking'}
                {activeWorkflow === 'test-drive' && 'Test Drive Booking'}
                {activeWorkflow === 'insurance' && 'Premium Insurance Quote'}
                {activeWorkflow === 'security' && 'VIP Security & Anti-Theft Setup'}
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
              <div className="mt-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  &#10003;
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeWorkflow === 'booking' && 'VIP Booking Request Confirmed'}
                  {activeWorkflow === 'test-drive' && 'Test Drive Registered'}
                  {activeWorkflow === 'insurance' && 'Quote Initiated'}
                  {activeWorkflow === 'security' && 'Security System Allocation Requested'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {activeWorkflow === 'booking' && `The Authorized ${product?.brand} Hub in ${selectedCity} is preparing doorstep logistics for your selected finish: ${activeLabel}.`}
                  {activeWorkflow === 'test-drive' && `Your VIP Test Drive request for ${product?.brand} ${product?.model_name} has been routed to the Authorized ${selectedCity} hub.`}
                  {activeWorkflow === 'insurance' && `Premium coverage evaluation is underway. Expect luxury insurer callback shortly.`}
                  {activeWorkflow === 'security' && `Authorized security engineers will contact you regarding tracker and immobilizer integration in ${selectedCity}.`}
                </p>

                {/* Instant Dealership WhatsApp Concierge Gateway */}
                <button
                  onClick={triggerWhatsAppConcierge}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  Connect via Dealership WhatsApp &rarr;
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/10"
                >
                  Close Gate &rarr;
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your official full name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contact Number</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={leadForm.countryCode}
                      onChange={(e) => setLeadForm({ ...leadForm, countryCode: e.target.value })}
                      className="rounded-lg border border-white/10 bg-black px-2.5 py-2.5 text-xs font-medium text-amber-400 outline-none focus:border-amber-400"
                    >
                      {Object.entries(REGION_REGISTRY).map(([code, r]) => (
                        <option key={code} value={r.dialCode || '+1'}>
                          {code} ({r.dialCode || '+1'})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      required
                      placeholder="Enter mobile number"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* VIP Security Armor Addon Tier Picker */}
                {activeWorkflow === 'security' && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Select Armor Tier</label>
                    <div className="space-y-1.5">
                      {SECURITY_PACKAGES.map((pkg) => (
                        <label 
                          key={pkg.id} 
                          className={`flex items-center justify-between rounded-lg border p-2 text-xs cursor-pointer transition ${
                            selectedSecurityPkg === pkg.id 
                              ? 'border-amber-400 bg-amber-400/10 text-white' 
                              : 'border-white/10 bg-black/30 text-neutral-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="sec-pkg"
                              checked={selectedSecurityPkg === pkg.id}
                              onChange={() => setSelectedSecurityPkg(pkg.id)}
                              className="accent-amber-400"
                            />
                            <span>{pkg.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400">{pkg.badge}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-neutral-400 space-y-1 select-none">
                  <p>Spec: <span className="text-white font-medium">{product?.brand} {product?.model_name}</span></p>
                  <p>Finish: <span className="text-amber-400 font-medium">{activeLabel}</span></p>
                  <p>Authorized Delivery: <span className="text-white font-medium">{selectedCity} Hub</span></p>
                  {activeWorkflow === 'booking' && (
                    <p className="text-amber-500 font-semibold border-t border-white/5 pt-1 mt-1 text-[10px] tracking-wider uppercase">
                      ⚠️ Doorstep Delivery Booking Fee: 2% Ex-Showroom (Secure escrow checkout in Hub)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full rounded-lg bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {leadSubmitting ? 'Routing Secure Order...' : 'Confirm Allocation Gateway'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google AdSense Compliant Global Footer */}
      <Footer />
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
