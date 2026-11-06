'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, ExternalLink, Gauge, LockKeyhole, Package, Search, ShoppingBag, Sparkles, Wrench, Zap } from 'lucide-react';

type PartCategory = 'Aero' | 'Brakes' | 'Exhaust' | 'Wheels';
type Retailer = 'Amazon' | 'Flipkart' | 'CJ';

type AssemblyPart = {
  id: string;
  name: string;
  category: PartCategory;
  description: string;
  fitment: string;
  priceLabel: string;
  position: { x: number; y: number };
  searchQuery: string;
  affiliateLinks: Partial<Record<Retailer, string>>;
};

const PARTS: AssemblyPart[] = [
  {
    id: 'aero-wing',
    name: 'Carbon-fiber aero wing',
    category: 'Aero',
    description: 'Track-focused high-downforce rear wing',
    fitment: 'Rear deck · Mount point A',
    priceLabel: 'Explore options',
    position: { x: 77, y: 25 },
    searchQuery: 'Porsche 911 GT3 carbon fiber rear wing',
    affiliateLinks: {},
  },
  {
    id: 'brake-rotors',
    name: 'Carbon-ceramic brake rotors',
    category: 'Brakes',
    description: 'Cross-drilled performance rotor set',
    fitment: 'Front axle · Mount point B',
    priceLabel: 'Explore options',
    position: { x: 24, y: 69 },
    searchQuery: 'Porsche 911 GT3 front brake rotor',
    affiliateLinks: {},
  },
  {
    id: 'titanium-exhaust',
    name: 'Titanium sport exhaust',
    category: 'Exhaust',
    description: 'Lightweight valved exhaust assembly',
    fitment: 'Rear underbody · Mount point C',
    priceLabel: 'Explore options',
    position: { x: 77, y: 69 },
    searchQuery: 'Porsche 911 GT3 titanium exhaust system',
    affiliateLinks: {},
  },
  {
    id: 'forged-wheels',
    name: 'Forged magnesium wheels',
    category: 'Wheels',
    description: 'Lightweight center-lock wheel set',
    fitment: 'Four corners · Mount point D',
    priceLabel: 'Explore options',
    position: { x: 24, y: 25 },
    searchQuery: 'Porsche 911 20 inch forged wheel',
    affiliateLinks: {},
  },
];

const CATEGORIES = ['All', 'Aero', 'Brakes', 'Exhaust', 'Wheels'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const CATEGORY_STYLE: Record<PartCategory, string> = {
  Aero: 'text-amber-300 border-amber-400/25 bg-amber-400/5',
  Brakes: 'text-orange-300 border-orange-400/25 bg-orange-400/5',
  Exhaust: 'text-sky-300 border-sky-400/25 bg-sky-400/5',
  Wheels: 'text-violet-300 border-violet-400/25 bg-violet-400/5',
};

function getAffiliateUrl(part: AssemblyPart, retailer: Retailer): string {
  const configured = part.affiliateLinks[retailer];
  if (configured) return configured;

  const query = encodeURIComponent(part.searchQuery);
  switch (retailer) {
    case 'Amazon':
      return `https://www.amazon.in/s?k=${query}`;
    case 'Flipkart':
      return `https://www.flipkart.com/search?q=${query}`;
    case 'CJ':
      return `https://www.cj.com`;
  }
}

function BlueprintCar() {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Chassis blueprint"
      className="h-full w-full overflow-visible select-none"
    >
      <defs>
        <pattern id="av-dots" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
          <circle cx="0.6" cy="0.6" r="0.22" fill="#fbbf24" opacity=".4" />
        </pattern>
        <linearGradient id="av-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity=".12" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity=".02" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill="url(#av-dots)" opacity=".5" />
      <path
        d="M50 5 C42 5 38 10 35 18 L29 31 L25 44 L25 72 L30 83 L37 91 L50 95 L63 91 L70 83 L75 72 L75 44 L71 31 L65 18 C62 10 58 5 50 5Z"
        fill="url(#av-body)"
        stroke="#fbbf24"
        strokeWidth=".55"
        strokeOpacity=".6"
        strokeDasharray="1.2 1.2"
      />
      <path d="M35 22 Q50 17 65 22 L69 36 Q50 40 31 36Z" fill="none" stroke="#fbbf24" strokeOpacity=".5" strokeWidth=".45" />
      <path d="M31 42 Q50 38 69 42 L67 60 Q50 64 33 60Z" fill="none" stroke="#fbbf24" strokeOpacity=".45" strokeWidth=".45" />
      <path d="M34 65 Q50 68 66 65 L63 81 Q50 86 37 81Z" fill="none" stroke="#fbbf24" strokeOpacity=".45" strokeWidth=".45" />
      <path d="M50 7 V93 M26 50 H74" stroke="#fbbf24" strokeOpacity=".2" strokeDasharray=".8 1.4" strokeWidth=".35" />
      {[
        [20, 27],
        [80, 27],
        [20, 73],
        [80, 73],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 3.2} y={y - 7} width="6.4" height="14" rx="2.4" fill="#090909" stroke="#fbbf24" strokeWidth=".65" strokeOpacity=".7" />
        </g>
      ))}
    </svg>
  );
}

export default function InteractiveAssemblyGame() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [activePart, setActivePart] = useState<string | null>(null);
  const [showGateway, setShowGateway] = useState<string | null>(null);
  const [fitmentError, setFitmentError] = useState(false);

  const complete = installed.length === PARTS.length;
  const progress = Math.round((installed.length / PARTS.length) * 100);

  const filteredParts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PARTS.filter((part) => {
      const matchesCategory = category === 'All' || part.category === category;
      const matchesQuery =
        !normalized ||
        `${part.name} ${part.category} ${part.description}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const installPart = useCallback((partId: string) => {
    if (installed.includes(partId)) return;
    setInstalled((prev) => {
      const next = [...prev, partId];
      if (next.length === PARTS.length) {
        // Complete state trigger
      }
      return next;
    });
    setFitmentError(false);
    setActivePart(partId);
  }, [installed]);

  const resetAssembly = useCallback(() => {
    setInstalled([]);
    setActivePart(null);
    setShowGateway(null);
    setFitmentError(false);
  }, []);

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-stone-100 shadow-2xl select-none">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-15%,rgba(251,191,36,.12),transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(52,211,153,.06),transparent_38%)]" />

      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-white/[0.08] px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.28em] text-amber-400">
            <span className="h-px w-7 bg-amber-400" />
            Apex Vault · Atelier Studio
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Virtual Assembly &amp; <span className="text-amber-400">Spare Parts Lab</span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Build elite supercars part-by-part using our interactive wireframe canvas.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-amber-400/20 bg-black/50 px-4 py-3 lg:self-auto">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
            <Gauge size={20} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-500">Build Status</div>
            <div className="mt-0.5 text-xs font-bold text-white">
              {complete ? 'Engine Revving' : 'Workshop Active'}
            </div>
          </div>
          <div className="ml-3 h-8 w-px bg-white/10" />
          <div className="min-w-12 text-right">
            <div className="font-mono text-lg font-black text-amber-400">{progress}%</div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-500">Ready</div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(310px,.85fr)]">
        {/* Blueprint Workshop */}
        <div className="border-b border-white/[0.08] p-4 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[.22em] text-neutral-500">01 / Chassis Blueprint</div>
              <div className="mt-0.5 text-xs font-bold text-neutral-200">Porsche 911 GT3 RS Platform</div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Live Snap Fitment
            </span>
          </div>

          <div className="relative mx-auto aspect-[1.15/1] w-full max-w-[650px] overflow-hidden rounded-2xl border border-white/10 bg-black p-5 sm:p-8 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
            <div className="absolute left-4 top-4 text-[8px] font-mono tracking-widest text-neutral-600">AV / CHASSIS 911-RS</div>

            <div className="absolute inset-[12%_13%]">
              <BlueprintCar />
              {PARTS.map((part, index) => {
                const isInstalled = installed.includes(part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => installPart(part.id)}
                    style={{ left: `${part.position.x}%`, top: `${part.position.y}%` }}
                    className={`group absolute z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs font-bold transition-all duration-300 ${
                      isInstalled
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'border-amber-400 bg-neutral-900 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:scale-110 hover:bg-amber-400 hover:text-black'
                    }`}
                  >
                    {isInstalled ? <Check size={18} /> : <span>{String(index + 1).padStart(2, '0')}</span>}
                    <span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-md border border-white/10 bg-black px-2 py-1 text-[9px] text-neutral-200 group-hover:block z-20">
                      {part.category} · {isInstalled ? 'Locked' : 'Click to Snap'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-[650px]">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500">
              <span>Installation Progress</span>
              <span className="font-mono text-amber-400 font-bold">{installed.length} / {PARTS.length} Locked</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-900">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Parts Catalogue & Search */}
        <aside className="p-4 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[.22em] text-neutral-500">02 / Spare Parts Catalogue</div>
              <h3 className="text-lg font-black uppercase text-white mt-0.5">OEM Components</h3>
            </div>
            <Package className="text-amber-400" size={20} />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 px-3 py-2.5 focus-within:border-amber-400 transition">
            <Search size={16} className="shrink-0 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search genuine parts..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-neutral-500"
            />
          </label>

          <div className="my-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                  category === item
                    ? 'border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
            {filteredParts.map((part) => {
              const isInstalled = installed.includes(part.id);
              return (
                <article
                  key={part.id}
                  className={`rounded-xl border p-3.5 transition duration-300 ${
                    isInstalled
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-white/10 bg-neutral-900/60 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${
                      isInstalled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-black text-amber-400'
                    }`}>
                      {part.category === 'Aero' ? <Sparkles size={18} /> :
                        part.category === 'Brakes' ? <Gauge size={18} /> :
                          part.category === 'Exhaust' ? <Zap size={18} /> : <Wrench size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase text-white">{part.name}</h4>
                        {isInstalled && <LockKeyhole size={13} className="text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{part.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${CATEGORY_STYLE[part.category]}`}>{part.category}</span>
                        <span className="text-[9px] text-neutral-500">{part.fitment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
                    <button
                      type="button"
                      onClick={() => installPart(part.id)}
                      disabled={isInstalled}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
                        isInstalled
                          ? 'cursor-default bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 hover:bg-amber-300 active:scale-[0.98]'
                      }`}
                    >
                      {isInstalled ? <><Check size={13} /> Installed &amp; Locked</> : <>Snap into place <ChevronRight size={13} /></>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGateway(showGateway === part.id ? null : part.id)}
                      aria-label={`Buy ${part.name}`}
                      className="grid h-8 w-9 place-items-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-300 hover:border-amber-400 hover:text-amber-400 transition"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>

                  {showGateway === part.id && (
                    <div className="mt-3 rounded-lg border border-amber-500/30 bg-black p-3 space-y-2">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Official Purchase Gateway</div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Amazon', 'Flipkart'] as Retailer[]).map((retailer) => {
                          const href = getAffiliateUrl(part, retailer);
                          return (
                            <a
                              key={retailer}
                              href={href}
                              target="_blank"
                              rel="sponsored noopener noreferrer"
                              className="flex items-center justify-between rounded-md border border-white/10 bg-neutral-900 px-2.5 py-2 text-[10px] font-bold uppercase text-neutral-200 hover:border-amber-400 hover:text-amber-400 transition"
                            >
                              {retailer} <ExternalLink size={11} />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Celebration Aura & Ignition Banner */}
      {complete && (
        <div className="relative overflow-hidden border-t-2 border-emerald-500 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 px-5 py-8 text-center sm:px-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <div className="relative">
            <span className="rounded bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/40">
              🔥 WOW, SUPER! ASSEMBLY COMPLETE
            </span>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Engine Ignition Successful — Ready for Track!
            </h3>
            <p className="mt-1 text-xs text-neutral-300">
              All genuine OEM carbon &amp; titanium components locked securely into the chassis registry.
            </p>
            <button
              type="button"
              onClick={resetAssembly}
              className="mt-6 rounded-xl border border-white/20 bg-neutral-900 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800"
            >
              Reset Build Studio
            </button>
          </div>
        </div>
      )}

      <footer className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-[9px] uppercase tracking-widest text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Apex Vault Global Verified Registry</span>
        <span>Precision Engineering &amp; Virtual Assembly Studio</span>
      </footer>
    </section>
  );
}
