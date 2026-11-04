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

export interface RegionConfig {
  name: string;
  currency: string;
  rate: number;
  symbol: string;
  vatRate: number;
  regFee: number;
  dialCode: string;
  cities: string[];
}

// Global Region Registry for simple component selectors
export const REGION_REGISTRY: Record<string, RegionConfig> = {
  US: {
    name: 'United States',
    currency: 'USD',
    rate: 1.0,
    symbol: '$',
    vatRate: 0.088,
    regFee: 0.03,
    dialCode: '+1',
    cities: ['New York, NY', 'Los Angeles, CA', 'Miami, FL', 'Austin, TX', 'San Francisco, CA', 'Las Vegas, NV'],
  },
  IN: {
    name: 'India',
    currency: 'INR',
    rate: 0.011,
    symbol: '₹',
    vatRate: 0.18,
    regFee: 0.12,
    dialCode: '+91',
    cities: ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune'],
  },
  AE: {
    name: 'United Arab Emirates',
    currency: 'AED',
    rate: 0.27,
    symbol: 'AED ',
    vatRate: 0.05,
    regFee: 0.02,
    dialCode: '+971',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  },
  GB: {
    name: 'United Kingdom',
    currency: 'GBP',
    rate: 1.28,
    symbol: '£',
    vatRate: 0.20,
    regFee: 0.05,
    dialCode: '+44',
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  },
};

// Full Detailed Countries Registry for advanced computations
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
      { id: 'in-hyd', name: 'Hyderabad', taxRate: 0.18 },
      { id: 'in-blr', name: 'Bangalore', taxRate: 0.19 },
      { id: 'in-bom', name: 'Mumbai', taxRate: 0.20 },
      { id: 'in-del', name: 'Delhi NCR', taxRate: 0.17 },
      { id: 'in-maa', name: 'Chennai', taxRate: 0.18 },
      { id: 'in-kol', name: 'Kolkata', taxRate: 0.18 },
    ],
  },
];

export const COUNTRIES: Country[] = TIER_1_COUNTRIES;

export const COUNTRY_INDEX: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c])
);
