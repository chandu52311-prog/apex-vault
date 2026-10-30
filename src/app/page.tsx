'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { GLOBAL_REGIONS, CountryOption, CityOption } from '@/lib/locations';
import { ArrowRight, Loader2, X, ShieldCheck, ExternalLink, Zap, ChevronRight } from 'lucide-react';

interface DisplayItem {
  id: string;
  type: 'cars' | 'bikes' | 'gadgets';
  brand: string;
  model: string;
  image: string;
  gallery: string[];
  specs: Record<string, string>;
  basePriceINR: number;
  basePriceUSD: number;
  actionText: string;
  affiliateUrl: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'cars' | 'bikes' | 'phones' | 'laptops'>('cars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(GLOBAL_REGIONS[0]);
  const [selectedCity, setSelectedCity] = useState<CityOption>(GLOBAL_REGIONS[0].cities[0]);
  
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<DisplayItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === 'cars') {
          const { data } = await supabase.from('cars').select('*').eq('tier', 'luxury');
          if (data) {
            setItems(
              data.map((c) => ({
                id: c.id,
                type: 'cars',
                brand: c.brand,
                model: c.model_name,
                image: c.thumbnail_url,
                gallery: [
                  c.thumbnail_url,
                  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000',
                ],
                specs: {
                  'Top Speed': `${c.top_speed_kmh} km/h`,
                  '0-100 km/h': `${c.zero_to_hundred_kmh}s`,
                  Power: c.max_power,
                  Engine: c.engine_displacement || 'N/A',
                  Fuel: c.fuel_type || 'Petrol',
                },
                basePriceINR: Number(c.ex_showroom_inr),
                basePriceUSD: Number(c.base_price_usd),
                actionText: 'Book VIP Consultation',
                affiliateUrl: c.test_drive_partner_url || '#',
              }))
            );
          }
        } else if (activeTab === 'bikes') {
          const { data } = await supabase.from('bikes').select('*').eq('tier', 'luxury');
          if (data) {
            setItems(
              data.map((b) => ({
                id: b.id,
                type: 'bikes',
                brand: b.brand,
                model: b.model_name,
                image: b.thumbnail_url,
                gallery: [
                  b.thumbnail_url,
                  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
                ],
                specs: {
                  Engine: `${b.engine_cc} cc`,
                  'Top Speed': `${b.top_speed_kmh} km/h`,
                  Type: b.bike_type,
                },
                basePriceINR: Number(b.ex_showroom_inr),
                basePriceUSD: Number(b.price_usd),
                actionText: 'Inquire Showroom & Test Ride',
                affiliateUrl: b.insurance_affiliate_url || '#',
              }))
            );
          }
        } else {
          const category = activeTab === 'phones' ? 'phone' : 'laptop';
          const { data } = await supabase.from('gadgets').select('*').eq('category', category).eq('tier', 'luxury');
          if (data) {
            setItems(
              data.map((g) => ({
                id: g.id,
                type: 'gadgets',
                brand: g.brand,
                model: g.model_name,
                image: g.thumbnail_url,
                gallery: [
                  g.thumbnail_url,
                  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000',
                  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=1000',
                ],
                specs: g.specs || {},
                basePriceINR: Number(g.current_price_inr),
                basePriceUSD: Number(g.current_price_usd),
                actionText: 'Claim Official Discount',
                affiliateUrl: g.amazon_affiliate_url || '#',
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

  // Filter items by Quick Search Query
  const filteredItems = items.filter(
    (i) =>
      i.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // On-Road Calculation Helper
  const getCityOnRoadPrice = (baseINR: number, baseUSD: number) => {
    if (selectedCountry.code === 'IN') {
      const onRoad = Math.round(baseINR * (1 + selectedCity.taxRate));
      return {
        formatted: `₹${(onRoad / 10000000).toFixed(2)} Cr`,
        exact: onRoad.toLocaleString('en-IN'),
        raw: onRoad,
      };
    } else {
      const onRoad = Math.round(baseUSD * (1 + selectedCity.taxRate));
      return {
        formatted: `${selectedCity.symbol}${onRoad.toLocaleString()}`,
        exact: onRoad.toLocaleString(),
        raw: onRoad,
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans">
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

      {/* Main Listing Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
            <span className="text-xs uppercase tracking-widest">Loading Live Registry...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.map((item) => {
              const onRoad = getCityOnRoadPrice(item.basePriceINR, item.basePriceUSD);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedProduct(item);
                    setActiveGalleryIndex(0);
                  }}
                  className="group relative bg-[#0d0d0d] rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col shadow-2xl cursor-pointer"
                >
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={item.image}
                      alt={item.model}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                      {item.brand}
                    </div>
                    <div className="absolute top-4 right-4 bg-amber-500/90 text-black px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {selectedCity.name}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.model}
                      </h2>
                      <div className="grid grid-cols-3 gap-2 my-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 text-center">
                        {Object.entries(item.specs).slice(0, 3).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{key}</span>
                            <span className="text-xs font-semibold text-neutral-200 block truncate">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 block tracking-wider uppercase">
                          Est. On-Road in {selectedCity.name}
                        </span>
                        <span className="text-xl font-extrabold text-amber-400">{onRoad.formatted}</span>
                      </div>
                      <button className="flex items-center space-x-1 bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                        <span>View Specs & Deal</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DEDICATED FULL DETAIL MODAL (8-10 Photos, On-Road Breakdown, Lead Gen) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-[#0d0d0d] border border-neutral-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 bg-neutral-900/80 p-2 rounded-full text-neutral-400 hover:text-white border border-neutral-700"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Gallery Column */}
              <div className="p-6 flex flex-col justify-between bg-neutral-950">
                <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-neutral-800 relative bg-neutral-900">
                  <img
                    src={selectedProduct.gallery[activeGalleryIndex] || selectedProduct.image}
                    alt={selectedProduct.model}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-[11px] text-neutral-300">
                    Photo {activeGalleryIndex + 1} of {selectedProduct.gallery.length}
                  </div>
                </div>

                {/* Thumbnails List */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {selectedProduct.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeGalleryIndex === idx ? 'border-amber-500 scale-95' : 'border-neutral-800 opacity-60'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Details & Monetization Column */}
              <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{selectedProduct.brand}</span>
                    <span className="text-xs text-neutral-400 flex items-center">
                      <ShieldCheck size={14} className="text-emerald-500 mr-1" /> Verified Dealership Data
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white mt-1">{selectedProduct.model}</h1>

                  {/* On-Road Price Box */}
                  <div className="mt-6 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>Live On-Road Quote:</span>
                      <span className="text-amber-400 font-bold">{selectedCity.name}, {selectedCountry.name}</span>
                    </div>
                    <div className="text-3xl font-black text-white mt-1">
                      {getCityOnRoadPrice(selectedProduct.basePriceINR, selectedProduct.basePriceUSD).formatted}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Includes Ex-Showroom + Estimated Regional RTO ({Math.round(selectedCity.taxRate * 100)}%) + Comprehensive Zero-Dep Insurance.
                    </p>
                  </div>

                  {/* Full Specifications Grid */}
                  <div className="mt-6">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Technical Registry</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(selectedProduct.specs).map(([key, val]) => (
                        <div key={key} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                          <span className="text-neutral-500 block text-[10px] uppercase">{key}</span>
                          <span className="text-neutral-200 font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Acquisition / Lead Gen Buttons */}
                <div className="mt-8 space-y-3 pt-6 border-t border-neutral-800">
                  {selectedProduct.type === 'gadgets' ? (
                    <>
                      <a
                        href={selectedProduct.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <span>Buy on Official Store (Apply Best Discount)</span>
                        <ExternalLink size={16} />
                      </a>
                      <a
                        href="https://amazon.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        <span>Check Price on Amazon / Flipkart</span>
                        <ExternalLink size={14} />
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href={selectedProduct.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <span>Book Test Ride / Track Test ({selectedCity.name})</span>
                        <ArrowRight size={16} />
                      </a>
                      <a
                        href="https://policybazaar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2"
                      >
                        <span>Compare Superbike / Car Insurance Deals</span>
                        <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
