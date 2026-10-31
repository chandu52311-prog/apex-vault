// src/lib/storage-registry.ts

export interface VehiclePathParams {
  category: 'cars' | 'bikes';
  brand: string;
  model: string;
  year?: number | string;
  variant?: string;
  color?: string;
}

export interface ProductPathParams {
  category: 'laptops' | 'phones' | 'tablets' | 'cameras' | 'smartwatches' | 
            'headphones' | 'speakers' | 'televisions' | 'gaming' | 
            'drones' | 'projectors' | 'monitors' | 'printers' | 'accessories';
  brand: string;
  model: string;
  year?: number | string;
  variant?: string;
}

export const CAR_BRANDS = [
  'bugatti', 'ferrari', 'lamborghini', 'porsche', 'rolls-royce', 'bentley',
  'mercedes-benz', 'mercedes-maybach', 'mercedes-amg', 'bmw', 'audi', 'mclaren',
  'aston-martin', 'pagani', 'koenigsegg', 'rimac', 'maserati', 'lotus', 'lexus',
  'land-rover', 'range-rover', 'cadillac', 'genesis', 'lucid', 'acura', 'infiniti',
  'alfa-romeo', 'other-brands'
] as const;

export const BIKE_BRANDS = [
  'ducati', 'bmw-motorrad', 'kawasaki', 'yamaha', 'honda', 'suzuki', 'aprilia',
  'mv-agusta', 'harley-davidson', 'triumph', 'ktm', 'indian-motorcycle', 'norton',
  'bimota', 'moto-guzzi', 'energica', 'zero-motorcycles', 'arch-motorcycle', 'other-brands'
] as const;

export const LAPTOP_BRANDS = [
  'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'razer',
  'microsoft', 'samsung', 'lg', 'gigabyte', 'alienware', 'other-brands'
] as const;

export const PHONE_BRANDS = [
  'apple', 'samsung', 'google', 'oneplus', 'oppo', 'vivo', 'xiaomi',
  'motorola', 'sony', 'honor', 'huawei', 'nothing', 'realme', 'other-brands'
] as const;

export const OTHER_ELECTRONICS_CATEGORIES = [
  'tablets', 'cameras', 'smartwatches', 'headphones', 'speakers',
  'televisions', 'gaming', 'drones', 'projectors', 'monitors',
  'printers', 'accessories'
] as const;

export const PRIVATE_DOC_DIRECTORIES = [
  'customers', 'dealers', 'invoices', 'orders', 'insurance', 'finance', 'verification'
] as const;

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Automatically generates standard storage paths for dynamic entry creation.
 */
export function generateVehiclePath(params: VehiclePathParams): string {
  const parts: string[] = ['vehicles', params.category, slugify(params.brand), slugify(params.model)];
  if (params.year) parts.push(String(params.year));
  if (params.variant) parts.push(slugify(params.variant));
  if (params.color) parts.push(slugify(params.color));
  return parts.join('/') + '/';
}

export function generateProductPath(params: ProductPathParams): string {
  const parts: string[] = ['products', params.category, slugify(params.brand), slugify(params.model)];
  if (params.year) parts.push(String(params.year));
  if (params.variant) parts.push(slugify(params.variant));
  return parts.join('/') + '/';
}

export function generatePrivateDocumentPath(docType: typeof PRIVATE_DOC_DIRECTORIES[number], entityId: string): string {
  return `private-documents/${docType}/${slugify(entityId)}/`;
}
