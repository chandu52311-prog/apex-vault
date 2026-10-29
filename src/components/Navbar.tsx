'use client';

import React from 'react';
import { Car, Bike, Smartphone, Laptop, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'cars', label: 'Supercars', icon: Car },
    { id: 'bikes', label: 'Superbikes', icon: Bike },
    { id: 'phones', label: 'Flagships', icon: Smartphone },
    { id: 'laptops', label: 'Workstations', icon: Laptop },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-lg flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-amber-500/10">
            A
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white">APEX<span className="text-amber-500">VAULT</span></span>
            <p className="text-[10px] text-neutral-400 tracking-widest uppercase">Curated Tier-1 Machines</p>
          </div>
        </div>

        {/* Global Switcher (Malls Concept) */}
        <nav className="flex space-x-1 sm:space-x-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Badge */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-neutral-400 border border-neutral-800 px-3 py-1.5 rounded-full bg-neutral-950">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>100% Verified Specs</span>
        </div>
      </div>
    </header>
  );
}