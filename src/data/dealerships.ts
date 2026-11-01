export const DEALERSHIP_HOTLINES: Record<string, string> = {
  Hyderabad: '919000000001',
  Bangalore: '919000000002',
  Mumbai: '919000000003',
  'Delhi NCR': '919000000004',
  Chennai: '919000000005',
  Dubai: '971500000001',
  default: '919000000000',
};

export function getDealerWhatsAppUrl(city: string, brand: string, model: string, color: string): string {
  const phone = DEALERSHIP_HOTLINES[city] || DEALERSHIP_HOTLINES['default'];
  const text = encodeURIComponent(
    `Hello Apex Vault Concierge,\n\nI have submitted allocation for ${brand} ${model}.\nFinish: ${color}\nDelivery City: ${city}\n\nPlease share official verification documents.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}
