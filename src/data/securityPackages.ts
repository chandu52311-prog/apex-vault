export interface SecurityAddon {
  id: string;
  title: string;
  badge: string;
  priceInr: number;
}

export const SECURITY_PACKAGES: SecurityAddon[] = [
  {
    id: 'sec-gps',
    title: 'Level 1: Satellite GPS & Remote Kill Switch',
    badge: 'Standard Defense',
    priceInr: 120000,
  },
  {
    id: 'sec-jam',
    title: 'Level 2: Anti-Jammer & 24/7 Security Escrow',
    badge: 'VIP Concierge',
    priceInr: 350000,
  },
  {
    id: 'sec-armor',
    title: 'Level 3: B6/B7 Ballistic Glass & Cabin Armor',
    badge: 'Executive Armor',
    priceInr: 2500000,
  },
];
