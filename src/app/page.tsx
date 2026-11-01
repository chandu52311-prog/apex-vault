'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { REGION_REGISTRY, RegionConfig } from '@/data/regions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState('IN');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [activeTab, setActiveTab] = useState<'cars' | 'bikes' | 'gadgets'>('cars');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auto-Detect User's Location (Top Priority IP Geolocation)
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

          setSelectedCity(matchedCity || availableCities[0] || 'Hyderabad');
        }
      } catch (err) {
        // Fallback default safe ga IN / Hyderabad untundi
      }
    }

    detectUserLocation();
  }, []);

  const region: RegionConfig = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['IN'] || {
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
    async function fetchCatalog() {
      setLoading(true);
      const { data } = await supabase.from(activeTab).select('*');
      if (data) setItems(data);
      setLoading(false);
    }
    fetchCatalog();
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      {/* GLOBAL HEADER WITH DYNAMIC REGION/CITY SELECTOR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-amber-400 flex items-center justify-center font-black text-black">A</div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase">APEXVAULT</h1>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">195-Nation Verified Registry</p>
          </div>
        </div>

        {/* Global Currency & City Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRegion}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedRegion(code);
              const nextCities = REGION_REGISTRY[code]?.cities;
              if (nextCities && nextCities.length > 0) {
                setSelectedCity(nextCities[0]);
              }
            }}
            className="rounded border border-white/15 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 outline-none focus:border-amber-400"
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
            className="rounded border border-white/15 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 outline-none focus:border-amber-400"
          >
            {(region.cities || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* CATEGORY TABS */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex gap-3">
        {(['cars', 'bikes', 'gadgets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-amber-400 text-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            {tab === 'cars' ? 'Supercars' : tab === 'bikes' ? 'Superbikes' : 'Flagships & Tech'}
          </button>
        ))}
      </div>

      {/* CATALOG GRID */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase text-white tracking-wide">
            {activeTab === 'cars' ? 'Supercars' : activeTab === 'bikes' ? 'Superbikes' : 'Luxury Devices'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Showing verified on-road pricing for <span className="text-amber-400 font-bold">{selectedCity} ({region.name})</span> in {region.currency}
          </p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-amber-400 text-xs tracking-widest uppercase">
            Loading Catalog...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              // Extract INR base price
              const baseInr = Number(item.current_price_inr ?? item.ex_showroom_inr ?? item.price ?? 0);
              const convertedBase = baseInr * region.rate;
              const tax = convertedBase * (region.vatRate + region.regFee);
              const total = convertedBase + tax;

              return (
                <Link
                  key={item.id}
                  href={`/item/${item.id}?t=${activeTab}`}
                  className="group rounded-2xl border border-white/10 bg-neutral-950 p-4 transition duration-300 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] block"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-900">
                    <img
                      src={item.thumbnail_url || item.gallery?.[0]}
                      alt={item.model_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold uppercase text-black">
                      {selectedCity}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      {item.brand}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      {item.tier || item.category}
                    </span>
                  </div>

                  <h3 className="mt-1 text-lg font-black uppercase text-white group-hover:text-amber-400 transition">
                    {item.model_name}
                  </h3>

                  <div className="mt-3 border-t border-white/5 pt-3">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500">
                      Est. Total in {selectedCity}
                    </span>
                    <p className="text-xl font-black text-amber-400">
                      {region.symbol}
                      {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
