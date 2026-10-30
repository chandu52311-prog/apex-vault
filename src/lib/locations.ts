'use client';

import { useState, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Tables & Region Setup                                             */
/* ------------------------------------------------------------------ */

export type Table = 'cars' | 'bikes' | 'gadgets';
export const TABLES: Table[] = ['cars', 'bikes', 'gadgets'];

export type CountryId = 'IN' | 'US' | 'AE' | 'GB';

export interface Metro {
  id: string;
  name: string;
  countryId: CountryId;
  taxRate: number;
}

export interface Country {
  id: CountryId;
  name: string;
  currency: string;
  symbol: string;
  taxLabel: string;
  insuranceRate: number;
  metros: Metro[];
}

export const COUNTRIES: Country[] = [
  {
    id: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    taxLabel: 'State RTO & Road Cess',
    insuranceRate: 0.035, // 3.5%
    metros: [
      { id: 'in-hyd', name: 'Hyderabad', countryId: 'IN', taxRate: 0.18 },
      { id: 'in-blr', name: 'Bangalore', countryId: 'IN', taxRate: 0.19 },
      { id: 'in-bom', name: 'Mumbai', countryId: 'IN', taxRate: 0.20 },
      { id: 'in-del', name: 'Delhi NCR', countryId: 'IN', taxRate: 0.17 },
      { id: 'in-maa', name: 'Chennai', countryId: 'IN', taxRate: 0.18 },
    ],
  },
  {
    id: 'US',
    name: 'USA',
    currency: 'USD',
    symbol: '$',
    taxLabel: 'State Sales Tax',
    insuranceRate: 0.03, // 3%
    metros: [
      { id: 'us-lax', name: 'Los Angeles, CA', countryId: 'US', taxRate: 0.095 },
      { id: 'us-mia', name: 'Miami, FL', countryId: 'US', taxRate: 0.07 },
      { id: 'us-nyc', name: 'New York, NY', countryId: 'US', taxRate: 0.088 },
      { id: 'us-atx', name: 'Austin, TX', countryId: 'US', taxRate: 0.0625 },
    ],
  },
  {
    id: 'AE',
    name: 'UAE',
    currency: 'AED',
    symbol: 'AED ',
    taxLabel: 'VAT',
    insuranceRate: 0.03, // 3%
    metros: [
      { id: 'ae-dxb', name: 'Dubai', countryId: 'AE', taxRate: 0.05 },
      { id: 'ae-auh', name: 'Abu Dhabi', countryId: 'AE', taxRate: 0.05 },
    ],
  },
  {
    id: 'GB',
    name: 'UK',
    currency: 'GBP',
    symbol: '£',
    taxLabel: 'VAT & Road Tax',
    insuranceRate: 0.04, // 4%
    metros: [
      { id: 'gb-lon', name: 'London', countryId: 'GB', taxRate: 0.20 },
      { id: 'gb-man', name: 'Manchester', countryId: 'GB', taxRate: 0.20 },
    ],
  },
];

export const ALL_METROS: Metro[] = COUNTRIES.flatMap((c) => c.metros);
export const COUNTRY_INDEX: Record<CountryId, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c])
) as Record<CountryId, Country>;

/* ------------------------------------------------------------------ */
/*  Categories Config                                                 */
/* ------------------------------------------------------------------ */

export type CategoryKey = 'supercars' | 'superbikes' | 'flagships' | 'workstations';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  blurb: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'supercars', label: 'Supercars', blurb: 'Pure performance thoroughbreds and hyper-GTs' },
  { key: 'superbikes', label: 'Superbikes', blurb: 'Track-bred litre-class hypersports and superbikes' },
  { key: 'flagships', label: 'Flagships', blurb: 'Elite smartphones, cameras and personal flagships' },
  { key: 'workstations', label: 'Workstations', blurb: 'Extreme computing workstations and battle rigs' },
];

export const isCategoryKey = (k: string | null): k is CategoryKey =>
  CATEGORIES.some((c) => c.key === k);

export const isVehicle = (cat: CategoryKey) => cat === 'supercars' || cat === 'superbikes';

/* ------------------------------------------------------------------ */
/*  Currency & Exchange Rates Conversion                              */
/* ------------------------------------------------------------------ */

const INR_PER_USD = 88.0;
const AED_PER_USD = 3.6725;
const GBP_PER_USD = 0.78;

export function formatMoney(amount: number, country: Country): string {
  if (country.id === 'IN') {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }
  return `${country.symbol}${Math.round(amount).toLocaleString()}`;
}

export const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/* ------------------------------------------------------------------ */
/*  Database Row Normalizer & Specs Parsing                           */
/* ------------------------------------------------------------------ */

export interface RawRow {
  id: string;
  brand?: string;
  model_name?: string;
  tier?: string;
  category?: string;
  thumbnail_url?: string;
  gallery?: string[] | string;
  base_price_usd?: number | string;
  price_usd?: number | string;
  current_price_usd?: number | string;
  ex_showroom_inr?: number | string;
  current_price_inr?: number | string;
  test_drive_partner_url?: string;
  insurance_affiliate_url?: string;
  amazon_affiliate_url?: string;
  specs?: any;
  top_speed_kmh?: number;
  zero_to_hundred_kmh?: number;
  max_power?: string;
  engine_displacement?: string;
  engine_cc?: number;
  bike_type?: string;
}

export interface CatalogItem {
  id: string;
  table: Table;
  category: CategoryKey;
  brand: string;
  modelName: string;
  tier: string | null;
  thumbnail: string | null;
  gallery: string[];
  baseInr: number | null;
  baseUsd: number | null;
  specs: { key: string; label: string; value: string }[];
  amazonUrl?: string;
  testDriveUrl?: string;
}

export function normalizeItem(row: RawRow, table: Table): CatalogItem {
  let category: CategoryKey = 'supercars';

  if (table === 'bikes') {
    category = 'superbikes';
  } else if (table === 'gadgets') {
    const rawCat = (row.category || '').toLowerCase();
    const model = (row.model_name || '').toLowerCase();
    const tier = (row.tier || '').toLowerCase();
    if (rawCat === 'laptop' || model.includes('macbook') || model.includes('laptop') || tier.includes('work')) {
      category = 'workstations';
    } else {
      category = 'flagships';
    }
  }

  // Gallery array normalization
  let gallery: string[] = [];
  if (Array.isArray(row.gallery)) {
    gallery = row.gallery.filter(Boolean);
  } else if (typeof row.gallery === 'string') {
    try {
      const parsed = JSON.parse(row.gallery);
      if (Array.isArray(parsed)) gallery = parsed;
      else gallery = [row.gallery];
    } catch {
      gallery = row.gallery.replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  if (row.thumbnail_url && !gallery.includes(row.thumbnail_url)) {
    gallery.unshift(row.thumbnail_url);
  }
  gallery = Array.from(new Set(gallery)).slice(0, 10);

  const baseInr = Number(row.ex_showroom_inr || row.current_price_inr) || null;
  const baseUsd = Number(row.base_price_usd || row.price_usd || row.current_price_usd) || null;

  const specsList: { key: string; label: string; value: string }[] = [];
  if (row.top_speed_kmh) specsList.push({ key: 'top_speed', label: 'Top Speed', value: `${row.top_speed_kmh} km/h` });
  if (row.zero_to_hundred_kmh) specsList.push({ key: '0_100', label: '0-100 km/h', value: `${row.zero_to_hundred_kmh}s` });
  if (row.max_power) specsList.push({ key: 'power', label: 'Max Power', value: String(row.max_power) });
  if (row.engine_displacement) specsList.push({ key: 'engine', label: 'Displacement', value: String(row.engine_displacement) });
  if (row.engine_cc) specsList.push({ key: 'cc', label: 'Displacement', value: `${row.engine_cc} cc` });
  if (row.bike_type) specsList.push({ key: 'type', label: 'Type', value: String(row.bike_type) });

  if (row.specs && typeof row.specs === 'object') {
    Object.entries(row.specs).forEach(([k, v]) => {
      specsList.push({ key: k, label: k.replace(/_/g, ' ').toUpperCase(), value: String(v) });
    });
  }

  return {
    id: String(row.id),
    table,
    category,
    brand: row.brand || '',
    modelName: row.model_name || '',
    tier: row.tier || null,
    thumbnail: row.thumbnail_url || null,
    gallery,
    baseInr,
    baseUsd,
    specs: specsList,
    amazonUrl: row.amazon_affiliate_url,
    testDriveUrl: row.test_drive_partner_url || row.insurance_affiliate_url,
  };
}

export function topSpecs(specs: { key: string; label: string; value: string }[], count = 3) {
  return specs.slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  On-Road & Tax Compute Engine                                      */
/* ------------------------------------------------------------------ */

export function computeOnRoad(item: CatalogItem, metro: Metro) {
  const country = COUNTRY_INDEX[metro.countryId];
  let base = 0;

  if (country.id === 'IN') {
    if (item.baseInr) base = item.baseInr;
    else if (item.baseUsd) base = item.baseUsd * INR_PER_USD;
  } else if (country.id === 'US') {
    if (item.baseUsd) base = item.baseUsd;
    else if (item.baseInr) base = item.baseInr / INR_PER_USD;
  } else if (country.id === 'AE') {
    const usd = item.baseUsd ? item.baseUsd : (item.baseInr || 0) / INR_PER_USD;
    base = usd * AED_PER_USD;
  } else if (country.id === 'GB') {
    const usd = item.baseUsd ? item.baseUsd : (item.baseInr || 0) / INR_PER_USD;
    base = usd * GBP_PER_USD;
  }

  if (base <= 0) return null;

  const tax = base * metro.taxRate;
  const vehicle = isVehicle(item.category);
  const insurance = vehicle ? base * country.insuranceRate : 0;
  const total = base + tax + insurance;

  return {
    base,
    tax,
    taxRate: metro.taxRate,
    insurance,
    insuranceRate: country.insuranceRate,
    total,
  };
}

/* ------------------------------------------------------------------ */
/*  Persistent Metro / Region State Hook                              */
/* ------------------------------------------------------------------ */

export function useRegion() {
  const [metroId, setMetroId] = useState<string>('in-hyd');

  useEffect(() => {
    const saved = localStorage.getItem('apex_selected_metro');
    if (saved && ALL_METROS.some((m) => m.id === saved)) {
      setMetroId(saved);
    }
  }, []);

  const setMetro = (id: string) => {
    if (ALL_METROS.some((m) => m.id === id)) {
      setMetroId(id);
      localStorage.setItem('apex_selected_metro', id);
    }
  };

  const metro = ALL_METROS.find((m) => m.id === metroId) || ALL_METROS[0];
  const country = COUNTRY_INDEX[metro.countryId];

  return { metro, country, setMetro };
}
