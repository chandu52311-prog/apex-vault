'use client';

import { useState, useEffect } from 'react';

export type Table = 'cars' | 'bikes' | 'gadgets';
export const TABLES: Table[] = ['cars', 'bikes', 'gadgets'];

export interface Metro {
  id: string;
  name: string;
  taxRate: number;
}

export interface Country {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  taxLabel: string;
  insuranceRate: number;
  exchangeRateToUSD: number;
  isTier1?: boolean;
  metros: Metro[];
}

// 1. TIER 1 PRIORITY LUXURY MARKETS
const TIER_1_COUNTRIES: Country[] = [
  {
    id: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    taxLabel: 'State RTO & Road Cess',
    insuranceRate: 0.035,
    exchangeRateToUSD: 88.0,
    isTier1: true,
    metros: [
      { id: 'in-hyd', name: 'Hyderabad', taxRate: 0.18 },
      { id: 'in-blr', name: 'Bangalore', taxRate: 0.19 },
      { id: 'in-bom', name: 'Mumbai', taxRate: 0.20 },
      { id: 'in-del', name: 'Delhi NCR', taxRate: 0.17 },
      { id: 'in-maa', name: 'Chennai', taxRate: 0.18 },
      { id: 'in-kol', name: 'Kolkata', taxRate: 0.18 },
      { id: 'in-ahd', name: 'Ahmedabad', taxRate: 0.17 },
      { id: 'in-pun', name: 'Pune', taxRate: 0.19 },
    ],
  },
  {
    id: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    taxLabel: 'State Sales Tax',
    insuranceRate: 0.03,
    exchangeRateToUSD: 1.0,
    isTier1: true,
    metros: [
      { id: 'us-lax', name: 'Los Angeles, CA', taxRate: 0.095 },
      { id: 'us-mia', name: 'Miami, FL', taxRate: 0.07 },
      { id: 'us-nyc', name: 'New York, NY', taxRate: 0.088 },
      { id: 'us-atx', name: 'Austin, TX', taxRate: 0.0625 },
      { id: 'us-sfo', name: 'San Francisco, CA', taxRate: 0.086 },
      { id: 'us-las', name: 'Las Vegas, NV', taxRate: 0.083 },
    ],
  },
  {
    id: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    symbol: 'AED ',
    taxLabel: 'Import VAT & Reg',
    insuranceRate: 0.025,
    exchangeRateToUSD: 3.67,
    isTier1: true,
    metros: [
      { id: 'ae-dxb', name: 'Dubai', taxRate: 0.05 },
      { id: 'ae-auh', name: 'Abu Dhabi', taxRate: 0.05 },
      { id: 'ae-shj', name: 'Sharjah', taxRate: 0.05 },
    ],
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    taxLabel: 'VAT & Road Tax',
    insuranceRate: 0.04,
    exchangeRateToUSD: 0.78,
    isTier1: true,
    metros: [
      { id: 'gb-lon', name: 'London', taxRate: 0.20 },
      { id: 'gb-man', name: 'Manchester', taxRate: 0.20 },
      { id: 'gb-bhm', name: 'Birmingham', taxRate: 0.20 },
    ],
  },
  {
    id: 'MC',
    name: 'Monaco',
    currency: 'EUR',
    symbol: '€',
    taxLabel: 'TVA Luxe',
    insuranceRate: 0.03,
    exchangeRateToUSD: 0.92,
    isTier1: true,
    metros: [{ id: 'mc-mte', name: 'Monte Carlo', taxRate: 0.20 }],
  },
  {
    id: 'DE',
    name: 'Germany',
    currency: 'EUR',
    symbol: '€',
    taxLabel: 'MwSt & KFZ-Steuer',
    insuranceRate: 0.032,
    exchangeRateToUSD: 0.92,
    isTier1: true,
    metros: [
      { id: 'de-muc', name: 'Munich', taxRate: 0.19 },
      { id: 'de-fra', name: 'Frankfurt', taxRate: 0.19 },
      { id: 'de-ber', name: 'Berlin', taxRate: 0.19 },
    ],
  },
  {
    id: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    symbol: 'SAR ',
    taxLabel: 'VAT & Customs',
    insuranceRate: 0.03,
    exchangeRateToUSD: 3.75,
    isTier1: true,
    metros: [
      { id: 'sa-ruh', name: 'Riyadh', taxRate: 0.15 },
      { id: 'sa-jed', name: 'Jeddah', taxRate: 0.15 },
    ],
  },
  {
    id: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    symbol: 'S$',
    taxLabel: 'COE & ARF Duty',
    insuranceRate: 0.025,
    exchangeRateToUSD: 1.34,
    isTier1: true,
    metros: [{ id: 'sg-sin', name: 'Singapore Central', taxRate: 1.10 }],
  },
  {
    id: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    symbol: 'CHF ',
    taxLabel: 'Automobilsteuer & MWST',
    insuranceRate: 0.028,
    exchangeRateToUSD: 0.88,
    isTier1: true,
    metros: [
      { id: 'ch-zrh', name: 'Zurich', taxRate: 0.12 },
      { id: 'ch-gva', name: 'Geneva', taxRate: 0.12 },
    ],
  },
  {
    id: 'JP',
    name: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    taxLabel: 'Automobile Acquisition Tax',
    insuranceRate: 0.025,
    exchangeRateToUSD: 152.0,
    isTier1: true,
    metros: [
      { id: 'jp-tyo', name: 'Tokyo', taxRate: 0.10 },
      { id: 'jp-osa', name: 'Osaka', taxRate: 0.10 },
    ],
  },
  {
    id: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    taxLabel: 'Luxury Car Tax (LCT)',
    insuranceRate: 0.035,
    exchangeRateToUSD: 1.52,
    isTier1: true,
    metros: [
      { id: 'au-syd', name: 'Sydney, NSW', taxRate: 0.33 },
      { id: 'au-mel', name: 'Melbourne, VIC', taxRate: 0.33 },
    ],
  },
  {
    id: 'QA',
    name: 'Qatar',
    currency: 'QAR',
    symbol: 'QAR ',
    taxLabel: 'Customs & Port Registration',
    insuranceRate: 0.025,
    exchangeRateToUSD: 3.64,
    isTier1: true,
    metros: [{ id: 'qa-doh', name: 'Doha', taxRate: 0.05 }],
  },
];

// 2. WORLDWIDE REMAINING COUNTRIES (UN-195 MEMBERS)
const GLOBAL_REST_NAMES: [string, string, string, string, number, number][] = [
  ['Afghanistan', 'AF', 'AFN', 'Af', 71.0, 0.10],
  ['Albania', 'AL', 'ALL', 'Lek', 93.0, 0.20],
  ['Algeria', 'DZ', 'DZD', 'DA', 134.0, 0.19],
  ['Andorra', 'AD', 'EUR', '€', 0.92, 0.045],
  ['Angola', 'AO', 'AOA', 'Kz', 850.0, 0.14],
  ['Argentina', 'AR', 'ARS', '$', 980.0, 0.35],
  ['Armenia', 'AM', 'AMD', '֏', 387.0, 0.20],
  ['Austria', 'AT', 'EUR', '€', 0.92, 0.20],
  ['Bahamas', 'BS', 'BSD', 'B$', 1.0, 0.12],
  ['Bahrain', 'BH', 'BHD', 'BD', 0.38, 0.10],
  ['Bangladesh', 'BD', 'BDT', '৳', 119.0, 0.25],
  ['Belgium', 'BE', 'EUR', '€', 0.92, 0.21],
  ['Bhutan', 'BT', 'BTN', 'Nu.', 88.0, 0.15],
  ['Brazil', 'BR', 'BRL', 'R$', 5.65, 0.30],
  ['Canada', 'CA', 'CAD', 'CA$', 1.38, 0.15],
  ['Chile', 'CL', 'CLP', '$', 940.0, 0.19],
  ['China', 'CN', 'CNY', '¥', 7.12, 0.20],
  ['Colombia', 'CO', 'COP', '$', 4200.0, 0.19],
  ['Croatia', 'HR', 'EUR', '€', 0.92, 0.25],
  ['Cyprus', 'CY', 'EUR', '€', 0.92, 0.19],
  ['Czech Republic', 'CZ', 'CZK', 'Kč', 23.0, 0.21],
  ['Denmark', 'DK', 'DKK', 'kr', 6.85, 0.25],
  ['Egypt', 'EG', 'EGP', 'E£', 48.5, 0.30],
  ['Finland', 'FI', 'EUR', '€', 0.92, 0.24],
  ['France', 'FR', 'EUR', '€', 0.92, 0.20],
  ['Greece', 'GR', 'EUR', '€', 0.92, 0.24],
  ['Hong Kong', 'HK', 'HKD', 'HK$', 7.78, 0.10],
  ['Hungary', 'HU', 'HUF', 'Ft', 365.0, 0.27],
  ['Indonesia', 'ID', 'IDR', 'Rp', 15600.0, 0.25],
  ['Ireland', 'IE', 'EUR', '€', 0.92, 0.23],
  ['Israel', 'IL', 'ILS', '₪', 3.75, 0.17],
  ['Italy', 'IT', 'EUR', '€', 0.92, 0.22],
  ['Kuwait', 'KW', 'KWD', 'KD', 0.31, 0.05],
  ['Luxembourg', 'LU', 'EUR', '€', 0.92, 0.17],
  ['Malaysia', 'MY', 'MYR', 'RM', 4.35, 0.20],
  ['Maldives', 'MV', 'MVR', 'Rf', 15.4, 0.16],
  ['Mexico', 'MX', 'MXN', 'Mex$', 19.8, 0.16],
  ['Netherlands', 'NL', 'EUR', '€', 0.92, 0.21],
  ['New Zealand', 'NZ', 'NZD', 'NZ$', 1.65, 0.15],
  ['Norway', 'NO', 'NOK', 'kr', 10.8, 0.25],
  ['Oman', 'OM', 'OMR', 'OMR ', 0.385, 0.05],
  ['Poland', 'PL', 'PLN', 'zł', 3.98, 0.23],
  ['Portugal', 'PT', 'EUR', '€', 0.92, 0.23],
  ['South Africa', 'ZA', 'ZAR', 'R', 17.6, 0.15],
  ['South Korea', 'KR', 'KRW', '₩', 1380.0, 0.10],
  ['Spain', 'ES', 'EUR', '€', 0.92, 0.21],
  ['Sweden', 'SE', 'SEK', 'kr', 10.5, 0.25],
  ['Thailand', 'TH', 'THB', '฿', 33.5, 0.25],
  ['Turkey', 'TR', 'TRY', '₺', 34.2, 0.40],
  ['Vietnam', 'VN', 'VND', '₫', 25000.0, 0.20],
];

const REST_OF_WORLD: Country[] = GLOBAL_REST_NAMES.map(([name, id, currency, symbol, exRate, tax]) => ({
  id,
  name,
  currency,
  symbol,
  taxLabel: 'Import & State Duty',
  insuranceRate: 0.03,
  exchangeRateToUSD: exRate,
  isTier1: false,
  metros: [
    { id: `${id.toLowerCase()}-cap`, name: `${name} Central Hub`, taxRate: tax }
  ]
}));

export const COUNTRIES: Country[] = [...TIER_1_COUNTRIES, ...REST_OF_WORLD];

export const COUNTRY_INDEX: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c])
);

export const ALL_METROS: (Metro & { countryId: string })[] = COUNTRIES.flatMap((c) =>
  c.metros.map((m) => ({ ...m, countryId: c.id }))
);

export type CategoryKey = 'supercars' | 'superbikes' | 'flagships' | 'workstations';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  blurb: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'supercars', label: 'Supercars', blurb: 'Pure performance thoroughbreds and hyper-GTs' },
  { key: 'superbikes', label: 'Superbikes', blurb: 'Track-bred litre-class hypersports and superbikes' },
  { key: 'flagships', label: 'Flagships', blurb: 'Elite smartphones and luxury hardware' },
  { key: 'workstations', label: 'Workstations', blurb: 'Extreme computing laptops and flagship rigs' },
];

export const isCategoryKey = (k: string | null): k is CategoryKey =>
  CATEGORIES.some((c) => c.key === k);

export const isVehicle = (cat: CategoryKey) => cat === 'supercars' || cat === 'superbikes';

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

export interface RawRow {
  id: string;
  brand?: string;
  model_name?: string;
  tier?: string;
  category?: string;
  thumbnail_url?: string;
  gallery?: string[] | string;
  colors?: any;
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
  colors: any[];
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

  const colors = Array.isArray(row.colors) ? row.colors : [];
  const baseInr = Number(row.ex_showroom_inr || row.current_price_inr) || null;
  const baseUsd = Number(row.base_price_usd || row.price_usd || row.current_price_usd) || null;

  const specsList: { key: string; label: string; value: string }[] = [];
  if (row.top_speed_kmh) specsList.push({ key: 'top_speed', label: 'Top Speed', value: `${row.top_speed_kmh} km/h` });
  if (row.zero_to_hundred_kmh) specsList.push({ key: '0_100', label: '0-100 km/h', value: `${row.zero_to_hundred_kmh}s` });
  if (row.max_power) specsList.push({ key: 'power', label: 'Horsepower', value: String(row.max_power) });
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
    colors,
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

export function computeOnRoad(item: CatalogItem, metro: Metro, country: Country) {
  let baseUSD = item.baseUsd;
  if (!baseUSD && item.baseInr) {
    baseUSD = item.baseInr / 88.0;
  }
  if (!baseUSD) return null;

  const baseLocal = baseUSD * country.exchangeRateToUSD;
  const tax = baseLocal * metro.taxRate;
  const vehicle = isVehicle(item.category);
  const insurance = vehicle ? baseLocal * country.insuranceRate : 0;
  const total = baseLocal + tax + insurance;

  return {
    base: baseLocal,
    tax,
    taxRate: metro.taxRate,
    insurance,
    insuranceRate: country.insuranceRate,
    total,
  };
}

export function useRegion() {
  const [countryId, setCountryId] = useState<string>('IN');
  const [metroId, setMetroId] = useState<string>('in-hyd');

  useEffect(() => {
    const savedCountry = localStorage.getItem('apex_selected_country');
    const savedMetro = localStorage.getItem('apex_selected_metro');
    if (savedCountry && COUNTRY_INDEX[savedCountry]) {
      setCountryId(savedCountry);
    }
    if (savedMetro) {
      setMetroId(savedMetro);
    }
  }, []);

  const selectCountry = (cId: string) => {
    const found = COUNTRY_INDEX[cId];
    if (found) {
      setCountryId(cId);
      const defaultMetro = found.metros[0]?.id || '';
      setMetroId(defaultMetro);
      localStorage.setItem('apex_selected_country', cId);
      localStorage.setItem('apex_selected_metro', defaultMetro);
    }
  };

  const selectMetro = (mId: string) => {
    setMetroId(mId);
    localStorage.setItem('apex_selected_metro', mId);
  };

  const country = COUNTRY_INDEX[countryId] || COUNTRIES[0];
  const metro = country.metros.find((m) => m.id === metroId) || country.metros[0];

  return { country, metro, selectCountry, selectMetro };
}
