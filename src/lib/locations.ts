export interface CityOption {
  name: string;
  currency: string;
  symbol: string;
  taxRate: number; // For On-Road calculation
}

export interface CountryOption {
  name: string;
  code: string;
  tier: 1 | 2;
  cities: CityOption[];
}

export const GLOBAL_REGIONS: CountryOption[] = [
  {
    name: 'India',
    code: 'IN',
    tier: 1,
    cities: [
      { name: 'Hyderabad', currency: 'INR', symbol: '₹', taxRate: 0.18 },
      { name: 'Bangalore', currency: 'INR', symbol: '₹', taxRate: 0.19 },
      { name: 'Mumbai', currency: 'INR', symbol: '₹', taxRate: 0.20 },
      { name: 'Delhi NCR', currency: 'INR', symbol: '₹', taxRate: 0.17 },
      { name: 'Chennai', currency: 'INR', symbol: '₹', taxRate: 0.18 },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    tier: 1,
    cities: [
      { name: 'Los Angeles, CA', currency: 'USD', symbol: '$', taxRate: 0.095 },
      { name: 'Miami, FL', currency: 'USD', symbol: '$', taxRate: 0.07 },
      { name: 'New York, NY', currency: 'USD', symbol: '$', taxRate: 0.088 },
      { name: 'Austin, TX', currency: 'USD', symbol: '$', taxRate: 0.0625 },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    tier: 1,
    cities: [
      { name: 'Dubai', currency: 'AED', symbol: 'AED', taxRate: 0.05 },
      { name: 'Abu Dhabi', currency: 'AED', symbol: 'AED', taxRate: 0.05 },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'UK',
    tier: 1,
    cities: [
      { name: 'London', currency: 'GBP', symbol: '£', taxRate: 0.20 },
      { name: 'Manchester', currency: 'GBP', symbol: '£', taxRate: 0.20 },
    ],
  },
];
