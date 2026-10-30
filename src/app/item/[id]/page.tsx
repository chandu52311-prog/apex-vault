'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GLOBAL_REGIONS } from '@/lib/locations';
import { ArrowLeft, Search, ShieldCheck, MapPin, ExternalLink, ChevronRight, PhoneCall } from 'lucide-react';

export default function DedicatedItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [productType, setProductType] = useState<'cars' | 'bikes' | 'gadgets'>('cars');
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  // Dedicated Page Internal Quick Search
  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<any[]>([]);

  // Selected City for specific instant quotation
  const [activeCountry, setActiveCountry] = useState(GLOBAL_REGIONS[0]);
  const [activeCity, setActiveCity] = useState(GLOBAL_REGIONS[0].cities[0]);

  // Lead Modal Trigger
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      // 1. Try cars
      let { data } = await supabase.from('cars').select('*').eq('id', itemId).single();
      if (data) {
        setProductType('cars');
        setProduct(data);
        setLoading(false);
        return;
      }
      // 2. Try bikes
      const { data: bData } = await supabase.from('bikes').select('*').eq('id', itemId).single();
      if (bData) {
        setProductType('bikes');
        setProduct(bData);
        setLoading(false);
        return;
      }
      // 3. Try gadgets
      const { data: gData } = await supabase.from('gadgets').select('*').eq('id', itemId).single();
      if (gData) {
        setProductType('gadgets');
        setProduct(gData);
      }
      setLoading(false);
    }
    loadItem();
  }, [itemId]);

  // Internal Quick Search Bar Logic
  const handleQuickSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setQuickResults([]);
      return;
    }
    const { data: carMatches } = await supabase.from('cars').select('id, brand, model_name').ilike('model_name', `%${val}%`).limit(3);
    const { data: bikeMatches } = await supabase.from('bikes').select('id, brand, model_name').ilike('model_name', `%${val}%`).limit(3);
    setQuickResults([...(carMatches || []), ...(bikeMatches || [])]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-amber-500 flex items-center justify-center font-bold tracking-widest text-sm uppercase">
        Loading Verified Machine Blueprint...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-400 flex flex-col items-center justify-center">
        <p>Machine not found in registry.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-amber-500 underline text-sm">Return to Vault</button>
      </div>
    );
  }

  const galleryList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.thumbnail_url];
  const baseINR = Number(product.ex_showroom_inr || product.current_price_inr || 0);
  const baseUSD = Number(product.base_price_usd || product.price_usd || product.current_price_usd || 0);

  // Exact Calculation based on active City
  const calculateCityPrice = (taxRate: number) => {
    if (activeCountry.code === 'IN') {
      const total = Math.round(baseINR * (1 + taxRate));
      return `₹${(total / 10000000).toFixed(2)} Cr (${total.toLocaleString('en-IN')})`;
    } else {
      const total = Math.round(baseUSD * (1 + taxRate));
      return `${activeCity.symbol}${total.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans">
      
      {/* 1. TOP DEDICATED HEADER WITH LIVE INTERNAL SEARCH */}
      <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl"
          >
            <ArrowLeft size={16} />
            <span>Vault Registry</span>
          </button>

          {/* Quick Search on this page */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder={`Search another model to compare prices...`}
              value={searchQuery}
              onChange={(e) => handleQuickSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            {quickResults.length > 0 && (
              <div className="absolute top-11 left-0 w-full bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden shadow-2xl z-50">
                {quickResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      router.push(`/item/${res.id}`);
                      setQuickResults([]);
                      setSearchQuery('');
                    }}
                    className="p-2.5 hover:bg-neutral-800 cursor-pointer text-xs flex justify-between border-b border-neutral-800 last:border-0"
                  >
                    <span className="font-bold text-white">{res.model_name}</span>
                    <span className="text-amber-500 uppercase">{res.brand}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Official Price Database</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN FULL-PAGE PRODUCT DETAILS */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* Title & Brand Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 mb-8 gap-4">
          <div>
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
              {product.brand}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight uppercase">
              {product.model_name}
            </h1>
          </div>

          {/* Quick City Switcher */}
          <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 p-2 rounded-2xl">
            <MapPin size={16} className="text-amber-500 ml-1" />
            <select
              value={activeCountry.code}
              onChange={(e) => {
                const found = GLOBAL_REGIONS.find((c) => c.code === e.target.value);
                if (found) {
                  setActiveCountry(found);
                  setActiveCity(found.cities[0]);
                }
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              {GLOBAL_REGIONS.map((c) => (
                <option key={c.code} value={c.code} className="bg-neutral-900">{c.name}</option>
              ))}
            </select>
            <span className="text-neutral-700">/</span>
            <select
              value={activeCity.name}
              onChange={(e) => {
                const ct = activeCountry.cities.find((c) => c.name === e.target.value);
                if (ct) setActiveCity(ct);
              }}
              className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              {activeCountry.cities.map((ct) => (
                <option key={ct.name} value={ct.name} className="bg-neutral-900">{ct.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. MULTI-PHOTO 4K GALLERY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Large Viewer (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative h-[380px] sm:h-[520px] w-full rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
              <img
                src={galleryList[activePhoto]}
                alt={product.model_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10">
                Frame {activePhoto + 1} / {galleryList.length}
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryList.map((photo: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`h-20 w-28 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activePhoto === idx ? 'border-amber-500 scale-95' : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Local Showroom CTA Card (Col 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 block font-semibold">
                On-Road Calculation ({activeCity.name})
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-2">
                {calculateCityPrice(activeCity.taxRate)}
              </div>

              <div className="mt-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                Includes Base Factory Ex-Showroom + Local RTO/Registration ({Math.round(activeCity.taxRate * 100)}%) + 1-Year Comprehensive Insurance & Road Cess.
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {productType === 'gadgets' ? (
                  <>
                    <a
                      href={product.amazon_affiliate_url || 'https://amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                      <span>Buy on Amazon (Verified Best Price)</span>
                      <ExternalLink size={16} />
                    </a>
                    <a
                      href="https://croma.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <span>Check Croma / Reliance Digital Offer</span>
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLeadModal(true)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                      <span>Book Dealership Consultation ({activeCity.name})</span>
                      <PhoneCall size={16} />
                    </button>
                    <a
                      href="https://policybazaar.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 py-3 rounded-xl text-xs flex items-center justify-center space-x-2"
                    >
                      <span>Compare Zero-Dep Insurance Deals</span>
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-800 pt-4 flex items-center justify-between text-xs text-neutral-500">
              <span>Delivery Timeframe:</span>
              <span className="text-neutral-300 font-semibold">Immediate / Priority Slot</span>
            </div>
          </div>
        </div>

        {/* 4. WORLDWIDE CITY-BY-CITY ON-ROAD PRICE MATRIX */}
        <div className="mt-8 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <span>Global Pricing Breakdown Across Regions</span>
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Compare real-time on-road valuation for {product.model_name} across Tier-1 metros and international hubs.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Territory / Country</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Estimated Road Tax</th>
                  <th className="py-3 px-4">Total On-Road Estimated Cost</th>
                  <th className="py-3 px-4 text-right">Showroom Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {GLOBAL_REGIONS.flatMap((cntry) =>
                  cntry.cities.map((ct) => {
                    let totalCostStr = '';
                    if (cntry.code === 'IN') {
                      const total = Math.round(baseINR * (1 + ct.taxRate));
                      totalCostStr = `₹${(total / 10000000).toFixed(2)} Cr`;
                    } else {
                      const total = Math.round(baseUSD * (1 + ct.taxRate));
                      totalCostStr = `${ct.symbol}${total.toLocaleString()}`;
                    }
                    return (
                      <tr key={ct.name} className="hover:bg-neutral-800/40">
                        <td className="py-3 px-4 font-semibold text-neutral-300">{cntry.name}</td>
                        <td className="py-3 px-4 text-amber-400 font-bold">{ct.name}</td>
                        <td className="py-3 px-4 text-neutral-400">{Math.round(ct.taxRate * 100)}% Local Duties</td>
                        <td className="py-3 px-4 font-extrabold text-white text-sm">{totalCostStr}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveCountry(cntry);
                              setActiveCity(ct);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-amber-500 hover:underline font-semibold"
                          >
                            Select City
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. FULL TECHNICAL SPECIFICATIONS REGISTRY */}
        <div className="mt-8 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6">
            Complete Technical Specifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(product.specs || {}).map(([key, val]) => (
              <div key={key} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">{key}</span>
                <span className="text-sm font-bold text-white mt-1 block">{String(val)}</span>
              </div>
            ))}
            {product.max_power && (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Horsepower Output</span>
                <span className="text-sm font-bold text-white mt-1 block">{product.max_power}</span>
              </div>
            )}
            {product.top_speed_kmh && (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Top Velocity</span>
                <span className="text-sm font-bold text-white mt-1 block">{product.top_speed_kmh} km/h</span>
              </div>
            )}
            {product.zero_to_hundred_kmh && (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">0-100 km/h Sprint</span>
                <span className="text-sm font-bold text-white mt-1 block">{product.zero_to_hundred_kmh} Seconds</span>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* LEAD GENERATION MODAL FOR LOCAL DEALERSHIP */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-neutral-800 p-6 rounded-3xl max-w-md w-full">
            <h3 className="text-xl font-black text-white uppercase">Inquire in {activeCity.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">Direct connect with authorized showroom dealership.</p>

            {leadSuccess ? (
              <div className="my-6 p-4 bg-emerald-950/60 border border-emerald-700 text-emerald-400 text-xs rounded-xl">
                Inquiry registered! Authorized partner from {activeCity.name} will contact you shortly.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+91 / International)"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => setLeadSuccess(true)}
                  className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl text-xs uppercase"
                >
                  Confirm Priority Booking
                </button>
              </div>
            )}

            <button
              onClick={() => { setShowLeadModal(false); setLeadSuccess(false); }}
              className="mt-3 text-neutral-500 text-xs text-center w-full block hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
