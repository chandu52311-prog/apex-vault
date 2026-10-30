'use client';

import React from 'react';
import { Car, Bike, Smartphone, Laptop, Search, MapPin } from 'lucide-react';
import { GLOBAL_REGIONS, CountryOption, CityOption } from '@/lib/locations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: CountryOption;
  setSelectedCountry: (c: CountryOption) => void;
  selectedCity: CityOption;
  setSelectedCity: (city: CityOption) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
}: NavbarProps) {
  const navTabs = [
    { id: 'cars', label: 'Supercars', icon: Car },
    { id: 'bikes', label: 'Superbikes', icon: Bike },
    { id: 'phones', label: 'Flagships', icon: Smartphone },
    { id: 'laptops', label: 'Workstations', icon: Laptop },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer self-start md:self-auto">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-lg flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
            A
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">APEX<span className="text-amber-500">VAULT</span></span>
            <span className="block text-[10px] text-neutral-400 tracking-widest uppercase">Global Verified Registry</span>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
          <input
            type="text"
            placeholder="Search specs, models, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Tier-1 Country & City Selectors */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-neutral-300">
            <MapPin size={14} className="text-amber-500 mr-1" />
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const found = GLOBAL_REGIONS.find((c) => c.code === e.target.value);
                if (found) {
                  setSelectedCountry(found);
                  setSelectedCity(found.cities[0]);
                }
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              {GLOBAL_REGIONS.map((c) => (
                <option key={c.code} value={c.code} className="bg-neutral-900">
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-neutral-600 px-1">/</span>
            <select
              value={selectedCity.name}
              onChange={(e) => {
                const city = selectedCountry.cities.find((ct) => ct.name === e.target.value);
                if (city) setSelectedCity(city);
              }}
              className="bg-transparent text-amber-400 font-semibold focus:outline-none cursor-pointer"
            >
              {selectedCountry.cities.map((ct) => (
                <option key={ct.name} value={ct.name} className="bg-neutral-900 text-white">
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-t border-neutral-900 bg-neutral-950/60 px-4 py-2 flex justify-center space-x-2 overflow-x-auto">
        {navTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
