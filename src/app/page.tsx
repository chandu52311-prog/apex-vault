'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { GLOBAL_REGIONS, CountryOption, CityOption } from '@/lib/locations';
import { Loader2, ChevronRight } from 'lucide-react';

interface DisplayItem {
  id: string;
  type: 'cars' | 'bikes' | 'gadgets';
  brand: string;
  model: string;
  image: string;
  specs: Record<string, string>;
  basePriceINR: number;
  basePriceUSD: number;
  actionText: string;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cars' | 'bikes' | 'phones' | 'laptops'>('cars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(GLOBAL_REGIONS[0]);
  const [selectedCity, setSelectedCity] = useState<CityOption>(GLOBAL_REGIONS[0].cities[0]);
  
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === 'cars') {
          const { data } = await supabase.from('cars').select('*').eq('tier', 'luxury').order('created_at', { ascending: false });
          if (data) {
            setItems(
              data.map((c) => ({
                id: c.id,
                type: 'cars',
                brand: c.brand,
                model: c.model_name,
                image: c.thumbnail_url,
                specs: {
                  'Top Speed': `${c.top_speed_kmh} km/h`,
                  '0-100 km/h': `${c.zero_to_hundred_kmh}s`,
                  Power: c.max_power,
                },
                basePriceINR: Number(c.ex_showroom_inr),
                basePriceUSD: Number(c.base_price_usd),
                actionText: 'View Specs & Regional Quote',
              }))
            );
          }
        } else if (activeTab === 'bikes') {
          const { data } = await supabase.from('bikes').select('*').eq('tier', 'luxury').order('created_at', { ascending: false });
          if (data) {
            setItems(
              data.map((b) => ({
                id: b.id,
                type: 'bikes',
                brand: b.brand,
                model: b.model_name,
                image: b.thumbnail_url,
                specs: {
                  Engine: `${b.engine_cc} cc`,
                  'Top Speed': `${b.top_speed_kmh} km/h`,
                  Type: b.bike_type,
                },
                basePriceINR: Number(b.ex_showroom_inr),
                basePriceUSD: Number(b.price_usd),
                actionText: 'View Specs & Regional Quote',
              }))
            );
          }
        } else {
          const category = activeTab === 'phones' ? 'phone' : 'laptop';
          const { data } = await supabase.from('gadgets').select('*').eq('category', category).eq('tier', 'luxury').order('created_at', { ascending: false });
          if (data) {
            setItems(
              data.map((g) => ({
                id: g.id,
                type: 'gadgets',
                brand: g.brand,
                model: g.model_name,
                image: g.thumbnail_url,
                specs: g.specs || {},
                basePriceINR: Number(g.current_price_inr),
                basePriceUSD: Number(g.current_price_usd),
                actionText: 'Check Official Deals',
              }))
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  const filteredItems = items.filter(
    (i) =>
      i.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCityOnRoadPrice = (baseINR: number, baseUSD: number) => {
    if (selectedCountry.code === 'IN') {
      const onRoad = Math.round(baseINR * (1 + selectedCity.taxRate));
      return {
        formatted: `₹${(onRoad / 10000000).toFixed(2)} Cr`,
        raw: onRoad,
      };
    } else {
      const onRoad = Math.round(baseUSD * (1 + selectedCity.taxRate));
      return {
        formatted: `${selectedCity.symbol}${onRoad.toLocaleString()}`,
        raw: onRoad,
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />

      {/* Hero Header */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full text-center">
        <span className="text-amber-500 text-xs font-semibold tracking-widest uppercase border border-amber-500/20 px-3 py-1 rounded-full bg-amber-500/5">
          Global Verified Registry
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mt-4 uppercase">
          Zero Clutter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Pure Power.</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto mt-2 text-xs sm:text-sm">
          Select any machine below to inspect high-res galleries, global price matrices, and local dealer booking.
        </p>
      </section>

      {/* Main Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
            <span className="text-xs uppercase tracking-widest">Loading Live Registry...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No matching models found. Try another search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.map((item) => {
              const onRoad = getCityOnRoadPrice(item.basePriceINR, item.basePriceUSD);
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/item/${item.id}`)}
                  className="group relative bg-[#0d0d0d] rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col shadow-2xl cursor-pointer"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={item.image}
                      alt={item.model}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                      {item.brand}
                    </div>
                    <div className="absolute top-4 right-4 bg-amber-500 text-black px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md">
                      {selectedCity.name}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.model}
                      </h2>
                      <div className="grid grid-cols-3 gap-2 my-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 text-center">
                        {Object.entries(item.specs).slice(0, 3).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">{key}</span>
                            <span className="text-xs font-semibold text-neutral-200 block truncate mt-0.5">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-neutral-400 block tracking-wider uppercase">
                          Est. On-Road in {selectedCity.name}
                        </span>
                        <span className="text-xl font-extrabold text-amber-400">{onRoad.formatted}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                        <span>Full Specs & Deals</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-900 bg-[#080808] py-8 text-center text-xs text-neutral-500">
        <p>© 2026 APEXVAULT Global. Zero Clutter Tier-1 Hub.</p>
      </footer>
    </div>
  );
}
