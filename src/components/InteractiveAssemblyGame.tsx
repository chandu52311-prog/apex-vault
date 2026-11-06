'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface GamePart {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  isSnapped: boolean;
}

const VEHICLE_PARTS_GAME: GamePart[] = [
  { id: 'part-1', name: 'Carbon Fiber Rear Aero Wing', category: 'Body & Aero', priceUsd: 12499, isSnapped: false },
  { id: 'part-2', name: 'Carbon Ceramic Brake Rotor', category: 'Braking System', priceUsd: 8999, isSnapped: false },
  { id: 'part-3', name: 'Titanium Quad Exhaust System', category: 'Exhaust', priceUsd: 6500, isSnapped: false },
  { id: 'part-4', name: 'Magnesium Center-Lock Wheel', category: 'Wheels', priceUsd: 9500, isSnapped: false },
];

export default function InteractiveAssemblyGame({ selectedRegion = 'US' }: { selectedRegion?: string }) {
  const [parts, setParts] = useState<GamePart[]>(VEHICLE_PARTS_GAME);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [engineStarted, setEngineStarted] = useState<boolean>(false);

  // Filter parts based on search query
  const filteredParts = useMemo(() => {
    return parts.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parts, searchQuery]);

  // Snap part into wireframe slot
  const handleSnapPart = (partId: string) => {
    setParts((prev) => {
      const updated = prev.map((p) => (p.id === partId ? { ...p, isSnapped: true } : p));
      // Check if all parts are snapped after this update
      if (updated.every((p) => p.isSnapped)) {
        setEngineStarted(true);
      }
      return updated;
    });
  };

  // Reset Game
  const handleReset = () => {
    setParts(VEHICLE_PARTS_GAME.map((p) => ({ ...p, isSnapped: false })));
    setEngineStarted(false);
  };

  const allSnapped = parts.every((p) => p.isSnapped);

  return (
    <div className={`min-h-screen bg-neutral-950 text-white p-6 sm:p-10 font-sans select-none transition-all duration-700 ${
      engineStarted ? 'shadow-[inset_0_0_100px_rgba(16,185,129,0.15)]' : ''
    }`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="rounded bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-400">
            Apex Vault Physics &amp; Assembly Lab
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            Porsche 911 GT3 RS — Custom Build Studio
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Reset Build
          </button>
          <Link
            href="/"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 transition hover:bg-amber-400 hover:text-black"
          >
            &larr; Exit to Vault
          </Link>
        </div>
      </div>

      {/* Celebration Aura & Engine Start Banner */}
      {engineStarted && (
        <div className="max-w-7xl mx-auto mb-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border-2 border-emerald-500 p-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] text-center animate-bounce-short">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">🔥 WOW, SUPER! ASSEMBLY COMPLETE</span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            Engine Ignition Successful — Lights On &amp; Ready for Track!
          </h2>
          <p className="text-xs text-neutral-300 mt-1">All genuine carbon &amp; titanium components locked securely into the chassis registry.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER: Wireframe Canvas & Vehicle Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-3xl border transition-all duration-700 bg-black p-6 shadow-2xl flex flex-col justify-between ${
            engineStarted ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-amber-500/30'
          }`}>
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className={`rounded-lg px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition-all ${
                engineStarted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-neutral-900 text-amber-400 border-white/10'
              }`}>
                {engineStarted ? '⚡ Vehicle Live & Revving' : 'Blueprint Wireframe Canvas'}
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {parts.filter((p) => p.isSnapped).length} / {parts.length} Parts Installed
              </span>
            </div>

            {/* Central Dotted Vehicle Silhouette with Target Slots */}
            <div className="relative z-10 my-auto flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[16/9] rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 flex items-center justify-center p-4">
                
                <div className="text-center text-neutral-500 text-xs font-mono uppercase tracking-widest">
                  [ Porsche 911 GT3 RS Chassis ]
                </div>

                {/* Drop Zones / Target Slots */}
                {parts.map((part, index) => (
                  <div
                    key={part.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSnapPart(part.id)}
                    className={`absolute rounded-xl border-2 px-3 py-2 text-center transition-all duration-500 flex items-center justify-center text-[10px] font-bold uppercase ${
                      part.isSnapped
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'border-dashed border-amber-400/50 bg-amber-400/5 text-amber-300 animate-pulse'
                    }`}
                    style={{
                      top: `${15 + index * 20}%`,
                      left: `${10 + (index % 2) * 50}%`,
                      width: '140px',
                    }}
                  >
                    {part.isSnapped ? `✓ ${part.name.split(' ')[0]} Locked` : `Drop Here: ${part.name.split(' ')[0]}`}
                  </div>
                ))}
              </div>
            </div>

            {/* Status Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-4">
              <span>💡 Drag components from right palette into the wireframe slots.</span>
              <span className={engineStarted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {engineStarted ? 'Fully Operational' : 'Assembly in Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Search Bar & Spare Parts Palette */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-1">
                Spare Parts Registry &amp; Search
              </h2>
              <p className="text-xs text-neutral-400 mb-4">
                Search specific components by name or category to build your vehicle[cite: 5].
              </p>

              {/* Search Bar Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search spare parts (e.g. Brakes, Wing, Exhaust)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            {/* Filtered Parts List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredParts.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">No matching spare parts found.</p>
              ) : (
                filteredParts.map((part) => (
                  <div
                    key={part.id}
                    draggable={!part.isSnapped}
                    onDragStart={() => {}}
                    className={`rounded-xl border p-4 transition-all duration-300 flex items-center justify-between ${
                      part.isSnapped
                        ? 'border-emerald-500/30 bg-emerald-950/10 opacity-50 cursor-not-allowed'
                        : 'border-white/10 bg-black/60 hover:border-amber-400/50 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                        {part.category}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-0.5">{part.name}</h3>
                      <p className="text-xs font-black text-amber-400 mt-1">${part.priceUsd.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      {part.isSnapped ? (
                        <span className="rounded bg-emerald-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSnapPart(part.id)}
                          className="rounded bg-amber-400 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-black transition hover:bg-amber-300"
                        >
                          Quick Add / Drag
                        </button>
                      )}

                      <a
                        href="https://amazon.com?tag=apexvault-20"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-400 underline transition"
                      >
                        Buy Deal
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
