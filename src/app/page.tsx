'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Loader2 } from 'lucide-react';

interface DisplayItem {
  id: string;
  brand: string;
  model: string;
  image: string;
  specs: Record<string, string>;
  priceINR: string;
  priceUSD: string;
  actionText: string;
  actionUrl: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cars' | 'bikes' | 'phones' | 'laptops'>('cars');
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === 'cars') {
          const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('tier', 'luxury')
            .order('created_at', { ascending: false });

          if (data) {
            setItems(
              data.map((c) => ({
                id: c.id,
                brand: c.brand,
                model: c.model_name,
                image: c.thumbnail_url,
                specs: {
                  'Top Speed': `${c.top_speed_kmh} km/h`,
                  '0-100 km/h': `${c.zero_to_hundred_kmh}s`,
                  Power: c.max_power,
                },
                priceINR: `₹${(c.ex_showroom_inr / 10000000).toFixed(2)} Cr`,
                priceUSD: `$${Number(c.base_price_usd).toLocaleString()}`,
                actionText: 'Book VIP Inquire',
                actionUrl: c.test_drive_partner_url || '#',
              }))
            );
          }
        } else if (activeTab === 'bikes') {
          const { data } = await supabase
            .from('bikes')
            .select('*')
            .eq('tier', 'luxury')
            .order('created_at', { ascending: false });

          if (data) {
            setItems(
              data.map((b) => ({
                id: b.id,
                brand: b.brand,
                model: b.model_name,
                image: b.thumbnail_url,
                specs: {
                  Engine: `${b.engine_cc} cc`,
                  'Top Speed': `${b.top_speed_kmh} km/h`,
                  Type: b.bike_type,
                },
                priceINR: `₹${(b.ex_showroom_inr / 100000).toFixed(2)} Lakh`,
                priceUSD: `$${Number(b.price_usd).toLocaleString()}`,
                actionText: 'Inquire Showroom',
                actionUrl: b.insurance_affiliate_url || '#',
              }))
            );
          }
        } else {
          const gadgetCategory = activeTab === 'phones' ? 'phone' : 'laptop';
          const { data } = await supabase
            .from('gadgets')
            .select('*')
            .eq('tier', 'luxury')
            .eq('category', gadgetCategory)
            .order('created_at', { ascending: false });

          if (data) {
            setItems(
              data.map((g) => ({
                id: g.id,
                brand: g.brand,
                model: g.model_name,
                image: g.thumbnail_url,
                specs: g.specs || {},
                priceINR: `₹${Number(g.current_price_inr).toLocaleString('en-IN')}`,
                priceUSD: `$${Number(g.current_price_usd).toLocaleString()}`,
                actionText: 'Buy on Store',
                actionUrl: g.amazon_affiliate_url || '#',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab as any} />

      <section className="relative px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full text-center">
        <span className="text-amber-500 text-xs font-semibold tracking-widest uppercase border border-amber-500/20 px-3 py-1 rounded-full bg-amber-500/5">
          Elite Machines Directory
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mt-4 uppercase">
          Zero Clutter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Pure Power.</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto mt-3 text-sm sm:text-base">
          Direct verified pricing, official specifications, and high-ticket acquisition links.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
            <span className="text-xs uppercase tracking-widest">Loading Live Registry...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No entries found in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-[#0d0d0d] rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-2xl"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                    {item.brand}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.model}
                    </h2>

                    <div className="grid grid-cols-3 gap-2 my-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 text-center">
                      {Object.entries(item.specs).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{key}</span>
                          <span className="text-xs sm:text-sm font-semibold text-neutral-200 mt-0.5 truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-neutral-400 block tracking-wider uppercase">Verified Market Base</span>
                      <span className="text-xl font-extrabold text-white">{item.priceINR}</span>
                      <span className="text-xs text-neutral-500 ml-2 font-medium">({item.priceUSD})</span>
                    </div>

                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-900 bg-[#080808] py-8 text-center text-xs text-neutral-500">
        <p>© 2026 APEXVAULT Global. Strictly Curated Flagship Lineup.</p>
      </footer>
    </div>
  );
}
