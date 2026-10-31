export interface RegionConfig {
  name: string;
  currency: string;
  rate: number; // Conversion from INR
  symbol: string;
  vatRate: number;
  regFee: number;
  cities: string[];
}

export const GLOBAL_REGIONS: Record<string, RegionConfig> = {
  IN: {
    name: 'India',
    currency: 'INR',
    rate: 1,
    symbol: '₹',
    vatRate: 0.28,
    regFee: 0.12,
    cities: ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata'],
  },
  US: {
    name: 'United States',
    currency: 'USD',
    rate: 0.012,
    symbol: '$',
    vatRate: 0.07,
    regFee: 0.03,
    cities: ['New York, NY', 'Los Angeles, CA', 'Miami, FL', 'Dallas, TX', 'San Francisco, CA'],
  },
  AE: {
    name: 'United Arab Emirates',
    currency: 'AED',
    rate: 0.044,
    symbol: 'AED ',
    vatRate: 0.05,
    regFee: 0.02,
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  },
  GB: {
    name: 'United Kingdom',
    currency: 'GBP',
    rate: 0.0095,
    symbol: '£',
    vatRate: 0.20,
    regFee: 0.05,
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  },
  MC: {
    name: 'Monaco',
    currency: 'EUR',
    rate: 0.011,
    symbol: '€',
    vatRate: 0.20,
    regFee: 0.02,
    cities: ['Monte Carlo', 'La Condamine'],
  },
  CH: {
    name: 'Switzerland',
    currency: 'CHF',
    rate: 0.0105,
    symbol: 'CHF ',
    vatRate: 0.08,
    regFee: 0.04,
    cities: ['Zurich', 'Geneva', 'Lugano'],
  },
  SG: {
    name: 'Singapore',
    currency: 'SGD',
    rate: 0.016,
    symbol: 'S$',
    vatRate: 0.09,
    regFee: 1.10, // High COE & registration duties in Singapore
    cities: ['Singapore Central', 'Marina Bay', 'Orchard'],
  },
  DE: {
    name: 'Germany',
    currency: 'EUR',
    rate: 0.011,
    symbol: '€',
    vatRate: 0.19,
    regFee: 0.03,
    cities: ['Munich', 'Frankfurt', 'Stuttgart', 'Berlin'],
  },
  SA: {
    name: 'Saudi Arabia',
    currency: 'SAR',
    rate: 0.045,
    symbol: 'SAR ',
    vatRate: 0.15,
    regFee: 0.02,
    cities: ['Riyadh', 'Jeddah', 'Khobar'],
  },
  JP: {
    name: 'Japan',
    currency: 'JPY',
    rate: 1.82,
    symbol: '¥',
    vatRate: 0.10,
    regFee: 0.05,
    cities: ['Tokyo', 'Osaka', 'Yokohama'],
  },
  AU: {
    name: 'Australia',
    currency: 'AUD',
    rate: 0.018,
    symbol: 'A$',
    vatRate: 0.10,
    regFee: 0.33, // Luxury Car Tax
    cities: ['Sydney', 'Melbourne', 'Brisbane'],
  },
  CA: {
    name: 'Canada',
    currency: 'CAD',
    rate: 0.016,
    symbol: 'CA$',
    vatRate: 0.13,
    regFee: 0.05,
    cities: ['Toronto', 'Vancouver', 'Montreal'],
  },
  FR: {
    name: 'France',
    currency: 'EUR',
    rate: 0.011,
    symbol: '€',
    vatRate: 0.20,
    regFee: 0.04,
    cities: ['Paris', 'Nice', 'Cannes'],
  },
  IT: {
    name: 'Italy',
    currency: 'EUR',
    rate: 0.011,
    symbol: '€',
    vatRate: 0.22,
    regFee: 0.04,
    cities: ['Milan', 'Rome', 'Bologna'],
  },
  QA: {
    name: 'Qatar',
    currency: 'QAR',
    rate: 0.044,
    symbol: 'QAR ',
    vatRate: 0.05,
    regFee: 0.02,
    cities: ['Doha', 'Lusail'],
  },
};
