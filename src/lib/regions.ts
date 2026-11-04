'use client';

export type Table = 'cars' | 'bikes' | 'gadgets';
export const TABLES: Table[] = ['cars', 'bikes', 'gadgets'];

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

// Full Global Countries List with Major Cities & Hubs
const TIER_1_COUNTRIES: Country[] = [
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
      { id: 'us-nyc', name: 'New York, NY', taxRate: 0.088 },
      { id: 'us-lax', name: 'Los Angeles, CA', taxRate: 0.095 },
      { id: 'us-mia', name: 'Miami, FL', taxRate: 0.07 },
      { id: 'us-atx', name: 'Austin, TX', taxRate: 0.0625 },
      { id: 'us-sfo', name: 'San Francisco, CA', taxRate: 0.086 },
      { id: 'us-las', name: 'Las Vegas, NV', taxRate: 0.083 },
      { id: 'us-chi', name: 'Chicago, IL', taxRate: 0.1025 },
    ],
  },
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
      { id: 'in-hyd', name: 'Hyderabad (Telangana)', taxRate: 0.18 },
      { id: 'in-blr', name: 'Bangalore (Karnataka)', taxRate: 0.19 },
      { id: 'in-bom', name: 'Mumbai (Maharashtra)', taxRate: 0.20 },
      { id: 'in-del', name: 'Delhi NCR', taxRate: 0.17 },
      { id: 'in-maa', name: 'Chennai (Tamil Nadu)', taxRate: 0.18 },
      { id: 'in-kol', name: 'Kolkata (West Bengal)', taxRate: 0.18 },
      { id: 'in-ahd', name: 'Ahmedabad (Gujarat)', taxRate: 0.17 },
      { id: 'in-pun', name: 'Pune (Maharashtra)', taxRate: 0.19 },
      { id: 'in-jai', name: 'Jaipur (Rajasthan)', taxRate: 0.18 },
      { id: 'in-lko', name: 'Lucknow (Uttar Pradesh)', taxRate: 0.18 },
      { id: 'in-chd', name: 'Chandigarh', taxRate: 0.17 },
      { id: 'in-cok', name: 'Kochi (Kerala)', taxRate: 0.20 },
      { id: 'in-vizag', name: 'Visakhapatnam (Andhra Pradesh)', taxRate: 0.18 },
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
];

const GLOBAL_REST_NAMES: [string, string, string, string, number, number][] = [
  ['Afghanistan', 'AF', 'AFN', 'Af', 71.0, 0.10],
  ['Albania', 'AL', 'ALL', 'Lek', 93.0, 0.20],
  ['Algeria', 'DZ', 'DZD', 'DA', 134.0, 0.19],
  ['Andorra', 'AD', 'EUR', '€', 0.92, 0.045],
  ['Argentina', 'AR', 'ARS', '$', 980.0, 0.35],
  ['Australia', 'AU', 'AUD', 'A$', 1.52, 0.33],
  ['Austria', 'AT', 'EUR', '€', 0.92, 0.20],
  ['Bahrain', 'BH', 'BHD', 'BD', 0.38, 0.10],
  ['Bangladesh', 'BD', 'BDT', '৳', 119.0, 0.25],
  ['Brazil', 'BR', 'BRL', 'R$', 5.65, 0.30],
  ['Canada', 'CA', 'CAD', 'CA$', 1.38, 0.15],
  ['China', 'CN', 'CNY', '¥', 7.12, 0.20],
  ['France', 'FR', 'EUR', '€', 0.92, 0.20],
  ['Italy', 'IT', 'EUR', '€', 0.92, 0.22],
  ['Japan', 'JP', 'JPY', '¥', 152.0, 0.10],
  ['Qatar', 'QA', 'QAR', 'QAR ', 3.64, 0.05],
  ['Saudi Arabia', 'SA', 'SAR', 'SAR ', 3.75, 0.15],
  ['Singapore', 'SG', 'SGD', 'S$', 1.34, 1.10],
  ['Switzerland', 'CH', 'CHF', 'CHF ', 0.88, 0.12],
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
