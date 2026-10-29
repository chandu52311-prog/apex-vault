'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Gauge, Zap, Flame, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

// Sample Curated Luxury Mock Data (Zero Junk / Pure Flagship)
const LUXURY_DATA = {
  cars: [
    {
      id: 'c1',
      brand: 'Porsche',
      model: '911 GT3 RS',
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000',
      specs: { topSpeed: '296 km/h', zeroToHundred: '3.2s', power: '518 bhp' },
      priceINR: '₹3.51 Cr',
      priceUSD: '$241,300',
      actionText: 'Book VIP Consultation',
      actionUrl: '#',
    },
    {
      id: 'c2',
      brand: 'Ferrari',
      model: '296 GTB Assetto',
      image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=1000',
      specs: { topSpeed: '330 km/h', zeroToHundred: '2.9s', power: '819 bhp' },
      priceINR: '₹5.40 Cr',
      priceUSD: '$342,000',
      actionText: 'Schedule Track Test',
      actionUrl: '#',
    }
  ],
  bikes: [
    {
      id: 'b1',
      brand: 'Ducati',
      model: 'Panigale V4 R',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
      specs: { topSpeed: '318 km/h', displacement: '998 cc', power: '218 bhp' },
      priceINR: '₹69.90 Lakh',
      priceUSD: '$45,000',
      actionText: 'Inquire Showroom',
      actionUrl: '#',
    }
  ],
  phones: [
    {
      id: 'p1',
      brand: 'Apple',
      model: 'iPhone 16 Pro Max (1TB)',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
      specs: { chip: 'A18 Pro (3nm)', display: '6.9" Super Retina XDR', camera: '48MP Fusion' },
      priceINR: '₹1,84,900',
      priceUSD: '$1,599',
      actionText: 'Buy on Amazon',
      actionUrl: 'https://amazon.in',
    }
  ],
  laptops: [
    {
      id: 'l1',
      brand: 'Apple',
      model: 'MacBook Pro 16" (M4 Max)',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000',
      specs: { cpu: '16-Core CPU', gpu: '40-Core GPU', ram: '128GB Unified' },
      priceINR: '₹4,99,900',
      priceUSD: '$4,699',
      actionText: 'Check Official Deals',
      actionUrl: 'https://amazon.in',
    }
  ]
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('cars');

  const currentItems = LUXURY_DATA[activeTab as keyof typeof LUXURY_DATA] || [];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Showcase Header */}
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

      {/* Main Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#0d0d0d] rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-2xl"
            >
              {/* Media Window */}
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

              {/* Specs & Pricing Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.model}
                  </h2>

                  {/* Dynamic Specs Row */}
                  <div className="grid grid-cols-3 gap-2 my-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 text-center">
                    {Object.entries(item.specs).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{key}</span>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-200 mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Monetization CTA */}
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
      </main>

      {/* Clean Bottom Bar */}
      <footer className="border-t border-neutral-900 bg-[#080808] py-8 text-center text-xs text-neutral-500">
        <p>© 2026 APEXVAULT Global. Strictly Curated Flagship Lineup.</p>
      </footer>
    </div>
  );
}