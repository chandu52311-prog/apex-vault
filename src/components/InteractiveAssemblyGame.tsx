'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface GamePart {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  shapeDescription: string;
  isSnapped: boolean;
}

const VEHICLE_PARTS_GAME: GamePart[] = [
  { id: 'part-1', name: 'Carbon Fiber Rear Aero Wing', category: 'Body & Aero', priceUsd: 12499, shapeDescription: 'Curved Airfoil', isSnapped: false },
  { id: 'part-2', name: 'Carbon Ceramic Brake Rotor', category: 'Braking System', priceUsd: 8999, shapeDescription: 'Circular Vented Disc', isSnapped: false },
  { id: 'part-3', name: 'Titanium Quad Exhaust System', category: 'Exhaust', priceUsd: 6500, shapeDescription: 'Dual-Tip Pipe', isSnapped: false },
  { id: 'part-4', name: 'Magnesium Center-Lock Wheel', category: 'Wheels', priceUsd: 9500, shapeDescription: 'Multi-Spoke Rim', isSnapped: false },
];

export default function InteractiveAssemblyGame({ selectedRegion = 'US' }: { selectedRegion?: string }) {
  const [parts, setParts] = useState<GamePart[]>(VEHICLE_PARTS_GAME);
  const [activeDraggingPart, setActiveDraggingPart] = useState<string | null>(null);
  const [selectedBuyPart, setSelectedBuyPart] = useState<GamePart | null>(null);

  // Simulate snapping part into wireframe slot
  const handleSnapPart = (partId: string) => {
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, isSnapped: true } : p))
    );
    setActiveDraggingPart(null);
  };

  const handleResetGame = () => {
    setParts(VEHICLE_PARTS_GAME.map((p) => ({ ...p, isSnapped: false })));
  };

  const allSnapped = parts.every((p) => p.isSnapped);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 sm:p-10 font-sans select-none">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="rounded bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-400">
            Apex Vault Physics Lab
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            Interactive Drag &amp; Snap Vehicle Assembly Game
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetGame}
            className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Reset Assembly
          </button>
          <Link
            href="/"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 transition hover:bg-amber-400 hover:text-black"
          >
            &larr; Back to Vault
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER: Dotted Wireframe Assembly Canvas Zone */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-amber-500/30 bg-black p-6 shadow-2xl flex flex-col justify-between">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-lg bg-neutral-900 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-400 border border-white/10">
                Blueprint Wireframe Canvas
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {parts.filter((p) => p.isSnapped).length} / {parts.length} Parts Locked in Place
              </span>
            </div>

            {/* Central Dotted Vehicle Silhouette with Target Slots */}
            <div className="relative z-10 my-auto flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[16/9] rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 flex items-center justify-center p-4">
                
                {/* Vehicle Outline Mock */}
                <div className="text-center text-neutral-600 text-xs font-mono uppercase tracking-widest">
                  [ Porsche 911 GT3 RS Base Chassis ]
                </div>

                {/* Drop Zones / Target Slots */}
                {parts.map((part, index) => (
                  <div
                    key={part.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSnapPart(part.id)}
                    className={`absolute rounded-xl border-2 px-3 py-2 text-center transition-all duration-500 flex items-center justify-center text-[10px] font-bold uppercase ${
                      part.isSnapped
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-bounce-short'
                        : 'border-dashed border-amber-400/50 bg-amber-400/5 text-amber-300 animate-pulse'
                    }`}
                    style={{
                      top: `${15 + index * 20}%`,
                      left: `${10 + (index % 2) * 50}%`,
                      width: '140px',
                    }}
                  >
                    {part.isSnapped ? `✓ ${part.name.split(' ')[0]} Locked` : `Drop: ${part.name.split(' ')[0]}`}
                  </div>
                ))}
              </div>
            </div>

            {/* Success Message Banner */}
            {allSnapped && (
              <div className="relative z-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 p-3 text-center text-xs font-bold uppercase tracking-widest text-emerald-400 animate-fade-in">
                🎉 Vehicle Fully Assembled &amp; Verified! Ready for On-Road Allocation.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Draggable Spare Parts Drawer / Palette */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-1">
              Component Palette (Drag &amp; Drop)
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Drag each spare part into its designated wireframe slot on the blueprint canvas.
            </p>

            <div className="space-y-3">
              {parts.map((part) => (
                <div
                  key={part.id}
                  draggable={!part.isSnapped}
                  onDragStart={() => setActiveDraggingPart(part.id)}
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
                        Placed
                      </span>
                    ) : (
                      <span className="rounded bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                        Drag Me &rarr;
                      </span>
                    )}

                    {/* Direct Buy Affiliate Action Gateway */}
                    <a
                      href={`https://amazon.com/dp/B00EXAMPLE?tag=apexvault-20`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-amber-400 underline transition"
                    >
                      Buy Store Deal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
