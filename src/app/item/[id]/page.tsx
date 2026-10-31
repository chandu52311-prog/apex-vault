'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COUNTRIES, formatMoney, useRegion, type Table } from '@/lib/locations';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Car, 
  Bike,
  Cpu,
  HardDrive
} from 'lucide-react';

interface ColorOption {
  name: string;
  hex: string;
  image: string;
  cities?: string[];
}

interface SpecItem {
  key: string;
  label: string;
  value: string;
}

function ItemDetailContent() {
  const params = useParams();
  const { metro, country, selectCountry, selectMetro } = useRegion();
  
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = useMemo(() => (rawId ? decodeURIComponent(rawId) : ''), [rawId]);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  
  // Flipkart/Amazon Style Tech Variants
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');

  // Lead modal
  const [leadOpen, setLeadOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadDone, setLeadDone] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadItem() {
      if (!id) return;
      setLoading(true);

      const tables: Table[] = ['cars', 'bikes', 'gadgets'];
      let foundData: any = null;

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
        if (data && !error) {
          foundData = { ...data, table };
          break;
        }
      }

      if (!isCancelled && foundData) {
        // Safe colors parse
        let parsedColors: ColorOption[] = [];
        if (Array.isArray(foundData.colors)) {
          parsedColors = foundData.colors;
        } else if (typeof foundData.colors === 'string') {
          try {
            parsedColors = JSON.parse(foundData.colors);
          } catch {
            parsedColors = [];
          }
        }

        // Safe gallery parse
        let parsedGallery: string[] = [];
        if (Array.isArray(foundData.gallery)) {
          parsedGallery = foundData.gallery.filter(Boolean);
        } else if (typeof foundData.gallery === 'string') {
          try {
            const g = JSON.parse(foundData.gallery);
            if (Array.isArray(g)) parsedGallery = g;
            else parsedGallery = [foundData.gallery];
          } catch {
            parsedGallery = foundData.gallery.replace(/[{}]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }

        foundData.colors = parsedColors;
        foundData.gallery = Array.from(new Set(parsedGallery));

        // Detect Sub-Section (Supercars, Superbikes, Flagships, Workstations)
        let sectionType: 'supercars' | 'superbikes' | 'flagships' | 'workstations' = 'supercars';
        if (foundData.table === 'cars') {
          sectionType = 'supercars';
        } else if (foundData.table === 'bikes') {
          sectionType = 'superbikes';
        } else {
          const cat = (foundData.category || '').toLowerCase();
          const nameLower = (foundData.model_name || '').toLowerCase();
          if (cat === 'laptop' || nameLower.includes('macbook') || nameLower.includes('laptop') || nameLower.includes('blade')) {
            sectionType = 'workstations';
          } else {
            sectionType = 'flagships';
          }
        }
        foundData.sectionType = sectionType;

        setProduct(foundData);

        // Default image and finish setup
        if (parsedColors.length > 0 && parsedColors[0].image) {
          setActiveImage(parsedColors[0].image);
          setActiveColor(parsedColors[0].name);
        } else if (foundData.thumbnail_url) {
          setActiveImage(foundData.thumbnail_url);
          setActiveColor('Standard Edition');
        } else if (parsedGallery.length > 0) {
          setActiveImage(parsedGallery[0]);
          setActiveColor('Studio View 1');
        }

        // Default laptop/phone variants
        if (sectionType === 'workstations') {
          setSelectedRam('32GB Unified Memory');
          setSelectedStorage('1TB SSD Storage');
        } else if (sectionType === 'flagships') {
          setSelectedStorage('256GB');
        }
      }

      if (!isCancelled) setLoading(false);
    }

    loadItem();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-amber-500 flex items-center justify-center font-bold tracking-widest text-xs uppercase">
        Loading Blueprint Specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-400 flex flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-widest">Item not registered in vault.</p>
        <Link href="/" className="mt-4 text-amber-500 underline text-xs">Return to Catalog</Link>
      </div>
    );
  }

  const isVehicle = product.sectionType === 'supercars' || product.sectionType === 'superbikes';
  const isWorkstation = product.sectionType === 'workstations';
  const isFlagship = product.sectionType === 'flagships';

  // Pricing calculation
  let baseUSD = Number(product.base_price_usd || product.price_usd || product.current_price_usd || 0);
  if (!baseUSD && product.ex_showroom_inr) {
    baseUSD = Number(product.ex_showroom_inr) / 88.0;
  }
  const baseLocal = baseUSD * (country.exchangeRateToUSD || 1.0);
  const tax = baseLocal * (metro.taxRate || 0.18);
  const insurance = isVehicle ? baseLocal * (country.insuranceRate || 0.035) : 0;
  const totalOnRoad = baseLocal + tax + insurance;

  // Stock check
  const activeColorObj = (product.colors as ColorOption[])?.find((c) => c.name === activeColor);
  const inStockAtCity = activeColorObj?.cities ? activeColorObj.cities.includes(metro.name) : true;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    await supabase.from('leads').insert({
      name: name.trim() || 'VIP Inquirer',
      phone: phone.trim(),
      city: metro.name,
      model: `${product.brand} ${product.model_name} (${activeColor}${selectedRam ? ` / ${selectedRam}` : ''})`,
      item_id: String(product.id),
      item_table: product.table,
    });
    setLeadDone(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Global Nav Header */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl transition"
          >
            <ArrowLeft size={15} />
            <span>Back to Vault</span>
          </Link>

          <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs">
            <MapPin size={14} className="text-amber-500 shrink-0" />
            <select
              value={country.id}
              onChange={(e) => selectCountry(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* Title Bar with Section Tag */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-5 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-500 text-[11px] font-black tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                {product.brand}
              </span>
              <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800 flex items-center gap-1.5">
                {isWorkstation && <Laptop size={12} className="text-blue-400" />}
                {isFlagship && <Smartphone size={12} className="text-purple-400" />}
                {product.sectionType === 'supercars' && <Car size={12} className="text-amber-400" />}
                {product.sectionType === 'superbikes' && <Bike size={12} className="text-emerald-400" />}
                {product.sectionType}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight uppercase">
              {product.model_name}
            </h1>
          </div>
          <div className="text-xs text-neutral-400 mt-3 sm:mt-0 flex items-center">
            <ShieldCheck size={16} className="text-emerald-500 mr-1.5" />
            {isVehicle ? 'Authorized Dealership Allocation' : 'Verified Official Brand Warranty'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLS: 4K HERO SHOWCASE & DYNAMIC SECTIONS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Showcase Image */}
            <div className="relative h-[420px] sm:h-[540px] w-full rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
              <img
                src={activeImage || product.thumbnail_url}
                alt={product.model_name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10 tracking-wide">
                {activeColor}
              </div>

              {/* Local Metro Stock Notification */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs">
                {inStockAtCity ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-emerald-400 font-bold">In Stock:</strong> Ready for immediate dispatch in <strong>{metro.name}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-amber-400 font-bold">Transit Required:</strong> Dispatches in 2 days to {metro.name}.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 3 & 4 (LAPTOPS & SMARTPHONES): FLIPKART/AMAZON STYLE COLOR CHIPS */}
            {(isWorkstation || isFlagship) && product.colors && product.colors.length > 0 && (
              <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                    Select Color Finish
                  </span>
                  <span className="text-xs font-extrabold text-amber-400">{activeColor}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.colors.map((c: ColorOption, idx: number) => {
                    const isSelected = activeColor === c.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveColor(c.name);
                          if (c.image) setActiveImage(c.image);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-900 border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-lg border border-white/20 shrink-0 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-white truncate">{c.name}</span>
                          <span className="block text-[10px] text-neutral-400">Official</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 4 (WORKSTATIONS / LAPTOPS): RAM & STORAGE SELECTOR */}
            {isWorkstation && (
              <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-neutral-400 mb-2">
                    <Cpu size={14} className="text-amber-500" />
                    <span>Memory (RAM)</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {['18GB Unified Memory', '32GB Unified Memory', '64GB Extreme Memory', '128GB Studio Memory'].map((ram) => (
                      <button
                        key={ram}
                        type="button"
                        onClick={() => setSelectedRam(ram)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                          selectedRam === ram
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-neutral-400 mb-2">
                    <HardDrive size={14} className="text-amber-500" />
                    <span>Storage Configuration</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {['512GB PCIe SSD', '1TB NVMe Fast SSD', '2TB Studio Ultra SSD', '4TB Pro Array'].map((ssd) => (
                      <button
                        key={ssd}
                        type="button"
                        onClick={() => setSelectedStorage(ssd)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                          selectedStorage === ssd
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {ssd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1 & 2 (SUPERCARS & SUPERBIKES): BESPOKE CIRCLES */}
            {isVehicle && product.colors && product.colors.length > 0 && (
              <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider block">Official Bespoke Finishes</span>
                  <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">{activeColor}</span>
                </div>

                <div className="flex items-center space-x-3">
                  {product.colors.map((c: ColorOption, idx: number) => {
                    const isSelected = activeColor === c.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveColor(c.name);
                          if (c.image) setActiveImage(c.image);
                        }}
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

            {/* ALL SECTIONS: MULTI-ANGLE GALLERY THUMBNAILS */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                    {isWorkstation ? 'Hardware Angles & Port Layout' : 'Studio Angles & Verified Views'}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-semibold">{product.gallery.length} High-Res Frames</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
                  {product.gallery.map((imgUrl: string, idx: number) => {
                    const isCurrent = activeImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImage(imgUrl);
                          const matching = (product.colors as ColorOption[])?.find((c) => c.image === imgUrl);
                          if (matching) setActiveColor(matching.name);
                          else setActiveColor(`Angle ${idx + 1}`);
                        }}
                        className={`h-20 w-32 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                          isCurrent ? 'border-amber-500 scale-95 shadow-md shadow-amber-500/20' : 'border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`angle-${idx}`} className="h-full w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 4 COLS: PRICING & ACTION BOX */}
          <div className="lg:col-span-4 bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 space-y-6">
            
            <div>
              <span className="text-[11px] uppercase tracking-widest text-neutral-400 block font-bold">
                {isVehicle ? `Live On-Road Price in ${metro.name}` : `Best Verified Price (${country.name})`}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 tracking-tight">
                {formatMoney(totalOnRoad, country)}
              </div>
              {!isVehicle && (
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  ✓ Includes all regional duties & doorstep delivery
                </span>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 text-xs border-t border-b border-neutral-800/80 py-4">
              <div className="flex justify-between text-neutral-400">
                <span>{isVehicle ? 'Factory Ex-Showroom:' : 'Base Retail Price:'}</span>
                <span className="text-white font-medium">{formatMoney(baseLocal, country)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>{country.taxLabel} ({Math.round(metro.taxRate * 100)}%):</span>
                <span className="text-white font-medium">{formatMoney(tax, country)}</span>
              </div>
              {isVehicle && (
                <div className="flex justify-between text-neutral-400">
                  <span>Zero-Dep Comprehensive Insurance:</span>
                  <span className="text-white font-medium">{formatMoney(insurance, country)}</span>
                </div>
              )}
            </div>

            {/* CALL TO ACTION BUTTONS */}
            <div className="space-y-3">
              {isVehicle ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Book VIP Test Drive in {metro.name}</span>
                    <PhoneCall size={15} />
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
              ) : (
                <>
                  <a
                    href={product.amazon_affiliate_url || 'https://amazon.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Buy on Amazon ({activeColor})</span>
                    <ExternalLink size={15} />
                  </a>
                  <a
                    href={`https://www.croma.com/searchB?q=${encodeURIComponent(product.model_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <span>Check Croma / Reliance Digital Offer</span>
                    <ExternalLink size={14} />
                  </a>
                </>
              )}
            </div>

            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
              {isVehicle ? (
                <>Connected Dealership: <strong>Authorized {product.brand} Hub ({metro.name})</strong>.</>
              ) : (
                <>Warranty Status: <strong>Direct Brand Authorized Indian Unit</strong>.</>
              )}
            </div>

          </div>
        </div>

        {/* TECHNICAL SPECS REGISTRY */}
        <div className="mt-12 bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6">
            Technical Registry & Specifications
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
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">{k.replace(/_/g, ' ')}</span>
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
              Booking allocation for <strong>{product.model_name}</strong> in {activeColor}.
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
              type="button"
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

export default function ItemDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] text-amber-500 flex items-center justify-center font-bold text-xs uppercase tracking-widest">Loading Blueprint...</div>}>
      <ItemDetailContent />
    </Suspense>
  );
}
