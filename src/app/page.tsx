'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Modular Data Architecture & Helpers
import { REGION_REGISTRY, RegionConfig } from '@/data/regions';
import { calculateMonthlyEMI } from '@/data/finance';

// Google AdSense Compliance Global Footer
import Footer from '@/components/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function HomePage() {
  // Default values ni US & New York ga set chesthunnam
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCity, setSelectedCity] = useState('New York, NY');
  
  // Updated to support 4 tabs including spare-parts
  const [activeTab, setActiveTab] = useState<'cars' | 'bikes' | 'gadgets' | 'spare-parts'>('cars');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auto-Detect User's Location (User unna exact country detect chesthundi)
  useEffect(() => {
    async function detectUserLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        const userCountry = data.country_code;
        const userCity = data.city;

        // User country code registry lo unte daaniki switch chesthundi
        if (userCountry && REGION_REGISTRY[userCountry]) {
          setSelectedRegion(userCountry);

          const availableCities = REGION_REGISTRY[userCountry].cities || [];
          const matchedCity = availableCities.find(
            (c) => c.toLowerCase() === (userCity || '').toLowerCase()
          );

          setSelectedCity(matchedCity || availableCities[0] || 'New York, NY');
        }
      } catch (err) {
        // IP fail aithe safe ga US / New York lone untundi
      }
    }

    detectUserLocation();
  }, []);

  // Safe fallback kooda US ke link chesthunnam
  const region: RegionConfig = REGION_REGISTRY[selectedRegion] || REGION_REGISTRY['US'] || {
    name: 'United States',
    currency: 'USD',
    rate: 0.012,
    symbol: '$',
    vatRate: 0.07,
    regFee: 0.03,
    dialCode: '+1',
    cities: ['New York, NY'],
  };

  // Fixed Catalog Fetching based on activeTab (Prevents Data Mixing)
  useEffect(() => {
    async function fetchCatalog() {
      if (activeTab === 'spare-parts') {
        setLoading(false);
        setItems([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from(activeTab)
        .select('*');
      
      if (data && !error) {
        setItems(data);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    fetchCatalog();
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-black text-neutral-100 flex flex-col justify-between select-none">
      <div>
        {/* GLOBAL HEADER WITH DYNAMIC REGION/CITY SELECTOR */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-amber-400 flex items-center justify-center font-black text-black">A</div>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase">APEXVAULT</h1>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Global Verified Registry</p>
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

        {/* CATEGORY TABS (4 Options including Spare Parts & Assembly Lab) */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-wrap gap-3">
          {(
            [
              { key: 'cars', label: 'Supercars' },
              { key: 'bikes', label: 'Superbikes' },
              { key: 'gadgets', label: 'Flagships & Tech' },
              { key: 'spare-parts', label: '⚙️ Spare Parts & Assembly Lab' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab.key
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CATALOG GRID OR ASSEMBLY LAB VIEW */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'spare-parts' ? (
            <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/20 p-8 sm:p-12 shadow-2xl">
              <span className="rounded bg-amber-500/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-400 border border-amber-500/30">
                Interactive Garage Mode
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-3">
                Virtual Assembly &amp; Spare Parts Studio
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                Build elite supercars part-by-part using our physics drag-and-drop wireframe canvas. Search genuine OEM components, snap them into place, and trigger full engine ignition.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/assembly/porsche-911-gt3-rs"
                  className="rounded-xl bg-amber-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 active:scale-[0.98]"
                >
                  Launch 911 GT3 RS Assembly Lab &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div>
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
                    // Extract INR base price & apply dynamic regional rate
                    const baseInr = Number(item.current_price_inr ?? item.ex_showroom_inr ?? item.price ?? 0);
                    const convertedBase = baseInr * region.rate;
                    const tax = convertedBase * (region.vatRate + region.regFee);
                    const total = convertedBase + tax;
                    const emi = calculateMonthlyEMI(total);

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

                        <div className="mt-3 border-t border-white/5 pt-3 flex items-end justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-neutral-500">
                              Est. Total in {selectedCity}
                            </span>
                            <p className="text-xl font-black text-amber-400">
                              {region.symbol}
                              {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          </div>

                          {/* Automotive Quick EMI Badge */}
                          {(activeTab === 'cars' || activeTab === 'bikes') && (
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-500">
                                Est. EMI
                              </span>
                              <p className="text-xs font-bold text-neutral-300">
                                {region.symbol}{emi.toLocaleString()}/mo
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google AdSense Compliant Footer */}
      <Footer />
    </main>
  );
}
