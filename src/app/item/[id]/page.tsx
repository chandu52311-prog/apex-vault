'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COUNTRIES, formatMoney, useRegion, type Table } from '@/lib/locations';
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';

interface ColorOption {
  name: string;
  hex: string;
  image: string;
  cities?: string[];
}

export default function ItemDetail() {
  const params = useParams();
  const router = useRouter();
  const { metro, country, selectCountry, selectMetro } = useRegion();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = decodeURIComponent(rawId || '');

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeColor, setActiveColor] = useState<ColorOption | null>(null);

  const [leadOpen, setLeadOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadDone, setLeadDone] = useState(false);

  useEffect(() => {
    async function loadMachine() {
      setLoading(true);
      const tables: Table[] = ['cars', 'bikes', 'gadgets'];
      for (const table of tables) {
        const { data } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
        if (data) {
          setProduct({ ...data, table });
          if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
            setActiveColor(data.colors[0]);
          }
          break;
        }
      }
      setLoading(false);
    }
    loadMachine();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-amber-500 flex items-center justify-center font-bold tracking-widest text-sm uppercase">
        Loading Elite Blueprint...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-400 flex flex-col items-center justify-center">
        <p>Machine not registered in vault.</p>
        <Link href="/" className="mt-4 text-amber-500 underline text-sm">Return to Vault</Link>
      </div>
    );
  }

  // Base price in USD converted to country local currency
  let baseUSD = Number(product.base_price_usd || product.price_usd || product.current_price_usd || 0);
  if (!baseUSD && product.ex_showroom_inr) {
    baseUSD = Number(product.ex_showroom_inr) / 88.0;
  }
  const baseLocal = baseUSD * country.exchangeRateToUSD;
  const tax = baseLocal * metro.taxRate;
  const insurance = product.table !== 'gadgets' ? baseLocal * country.insuranceRate : 0;
  const totalOnRoad = baseLocal + tax + insurance;

  const currentImage = activeColor ? activeColor.image : product.thumbnail_url;
  const inStockAtCity = activeColor?.cities ? activeColor.cities.includes(metro.name) : true;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    await supabase.from('leads').insert({
      name: name.trim() || 'VIP Inquirer',
      phone: phone.trim(),
      city: metro.name,
      model: `${product.brand} ${product.model_name} (${activeColor?.name || 'Selected Spec'})`,
      item_id: product.id,
      item_table: product.table,
    });
    setLeadDone(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl"
          >
            <ArrowLeft size={16} />
            <span>Back to Vault</span>
          </Link>

          <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs">
            <MapPin size={14} className="text-amber-500" />
            <select
              value={country.id}
              onChange={(e) => selectCountry(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
            <span className="text-neutral-700">/</span>
            <select
              value={metro.id}
              onChange={(e) => selectMetro(e.target.value)}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              {country.metros.map((m) => (
                <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Luxury Showcase */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-4 mb-6">
          <div>
            <span className="text-amber-500 text-xs font-black tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
              {product.brand}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight uppercase">
              {product.model_name}
            </h1>
          </div>
          <div className="text-xs text-neutral-400 mt-2 sm:mt-0 flex items-center">
            <ShieldCheck size={16} className="text-emerald-500 mr-1.5" />
            Direct Authorized Dealership Allocation
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MASSIVE 4K PHOTO & COLOR PALETTE */}
          <div className="lg:col-span-8 space-y-5">
            <div className="relative h-[420px] sm:h-[540px] w-full rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
              <img
                src={currentImage}
                alt={product.model_name}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
              />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10">
                {activeColor ? activeColor.name : 'Factory Edition'}
              </div>

              {/* City Stock Status */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs">
                {inStockAtCity ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-emerald-400">In Stock:</strong> Available for immediate delivery in <strong>{metro.name}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-amber-400">Transit Required:</strong> Not in {metro.name} hub. 3-day transfer from regional port.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* LIVE COLOR CIRCLES */}
            {product.colors && product.colors.length > 0 && (
              <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider block">Official Bespoke Finishes</span>
                  <span className="text-sm font-extrabold text-amber-400">{activeColor?.name}</span>
                </div>

                <div className="flex items-center space-x-3">
                  {product.colors.map((c: ColorOption, idx: number) => {
                    const isSelected = activeColor?.name === c.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveColor(c)}
                        title={c.name}
                        className={`group relative flex items-center justify-center p-1 rounded-full transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-white/20 shadow-inner block"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE ON-ROAD BREAKDOWN & DEALER INQUIRY */}
          <div className="lg:col-span-4 bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 space-y-6">
            
            <div>
              <span className="text-[11px] uppercase tracking-widest text-neutral-400 block font-bold">
                Live On-Road Price in {metro.name}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1">
                {formatMoney(totalOnRoad, country)}
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-b border-neutral-800/80 py-4">
              <div className="flex justify-between text-neutral-400">
                <span>Factory Ex-Showroom:</span>
                <span className="text-white font-medium">{formatMoney(baseLocal, country)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>{country.taxLabel} ({Math.round(metro.taxRate * 100)}%):</span>
                <span className="text-white font-medium">{formatMoney(tax, country)}</span>
              </div>
              {product.table !== 'gadgets' && (
                <div className="flex justify-between text-neutral-400">
                  <span>Zero-Dep Comprehensive Insurance:</span>
                  <span className="text-white font-medium">{formatMoney(insurance, country)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {product.table === 'gadgets' ? (
                <>
                  <a
                    href={product.amazon_affiliate_url || 'https://amazon.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Buy on Amazon ({activeColor?.name || 'Selected'})</span>
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href={`https://www.croma.com/searchB?q=${encodeURIComponent(product.model_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <span>Check Croma / Reliance Digital Offer</span>
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLeadOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Book Test Drive in {metro.name}</span>
                    <PhoneCall size={16} />
                  </button>
                  <a
                    href={product.test_drive_partner_url || 'https://policybazaar.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 py-3 rounded-xl text-xs flex items-center justify-center space-x-2"
                  >
                    <span>Compare Zero-Dep Insurance Plans</span>
                    <ExternalLink size={14} />
                  </a>
                </>
              )}
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
              Connected Showroom: <strong>Authorized {product.brand} Hub ({metro.name})</strong>.
            </div>

          </div>
        </div>

        {/* FULL TECHNICAL REGISTRY */}
        <div className="mt-12 bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6">
            Technical Registry & Performance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.max_power && (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Horsepower</span>
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
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">0-100 km/h</span>
                <span className="text-sm font-bold text-white mt-1 block">{product.zero_to_hundred_kmh}s</span>
              </div>
            )}
            {product.engine_displacement && (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Displacement</span>
                <span className="text-sm font-bold text-white mt-1 block">{product.engine_displacement}</span>
              </div>
            )}
            {product.specs && typeof product.specs === 'object' && Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">{k}</span>
                <span className="text-sm font-bold text-white mt-1 block">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* LEAD CONSULTATION MODAL */}
      {leadOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-neutral-800 p-6 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase">Inquire in {metro.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Booking allocation for <strong>{product.model_name}</strong> in {activeColor?.name || 'Selected Spec'}.
            </p>

            {leadDone ? (
              <div className="my-6 p-4 bg-emerald-950/60 border border-emerald-700 text-emerald-400 text-xs rounded-xl">
                Consultation registered! Authorized dealership in {metro.name} will call you shortly.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (+91 / International)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Confirm Priority Booking
                </button>
              </form>
            )}

            <button
              onClick={() => { setLeadOpen(false); setLeadDone(false); }}
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
