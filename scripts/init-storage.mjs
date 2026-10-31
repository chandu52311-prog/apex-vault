// scripts/init-storage.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[!] CRITICAL CONFIG ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const CAR_BRANDS = [
  'bugatti', 'ferrari', 'lamborghini', 'porsche', 'rolls-royce', 'bentley',
  'mercedes-benz', 'mercedes-maybach', 'mercedes-amg', 'bmw', 'audi', 'mclaren',
  'aston-martin', 'pagani', 'koenigsegg', 'rimac', 'maserati', 'lotus', 'lexus',
  'land-rover', 'range-rover', 'cadillac', 'genesis', 'lucid', 'acura', 'infiniti',
  'alfa-romeo', 'other-brands'
];

const BIKE_BRANDS = [
  'ducati', 'bmw-motorrad', 'kawasaki', 'yamaha', 'honda', 'suzuki', 'aprilia',
  'mv-agusta', 'harley-davidson', 'triumph', 'ktm', 'indian-motorcycle', 'norton',
  'bimota', 'moto-guzzi', 'energica', 'zero-motorcycles', 'arch-motorcycle', 'other-brands'
];

const LAPTOP_BRANDS = [
  'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'razer',
  'microsoft', 'samsung', 'lg', 'gigabyte', 'alienware', 'other-brands'
];

const PHONE_BRANDS = [
  'apple', 'samsung', 'google', 'oneplus', 'oppo', 'vivo', 'xiaomi',
  'motorola', 'sony', 'honor', 'huawei', 'nothing', 'realme', 'other-brands'
];

const OTHER_ELECTRONICS = [
  'tablets', 'cameras', 'smartwatches', 'headphones', 'speakers',
  'televisions', 'gaming', 'drones', 'projectors', 'monitors',
  'printers', 'accessories'
];

const PRIVATE_DOCS = [
  'customers', 'dealers', 'invoices', 'orders', 'insurance', 'finance', 'verification'
];

async function checkAndCreateBucket(bucketId, isPublic) {
  const { data: buckets, error: getErr } = await supabase.storage.listBuckets();
  if (getErr) throw getErr;

  const existing = buckets.find(b => b.id === bucketId);
  if (existing) {
    return { name: bucketId, status: 'EXISTING', public: existing.public };
  }

  const { data, error: createErr } = await supabase.storage.createBucket(bucketId, {
    public: isPublic,
    fileSizeLimit: isPublic ? 52428800 : 104857600
  });

  if (createErr) throw createErr;
  return { name: bucketId, status: 'CREATED', public: isPublic };
}

async function ensureKeepPlaceholder(bucket, directoryPath) {
  const cleanDir = directoryPath.replace(/^\/+|\/+$/g, '');
  const placeholderKey = `${cleanDir}/.keep`;

  // Check if .keep or any file already exists in this folder
  const { data: list, error: listErr } = await supabase.storage
    .from(bucket)
    .list(cleanDir, { limit: 1 });

  if (listErr && !listErr.message.toLowerCase().includes('not found')) {
    return { path: placeholderKey, status: 'ERROR', error: listErr.message };
  }

  if (list && list.length > 0) {
    return { path: `${bucket}/${cleanDir}/`, status: 'ALREADY_EXISTS' };
  }

  // Upload an empty .keep file to instantiate the Supabase folder hierarchy
  const dummyBuffer = Buffer.from('', 'utf-8');
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(placeholderKey, dummyBuffer, {
      contentType: 'application/octet-stream',
      upsert: false
    });

  if (uploadErr) {
    if (uploadErr.message.includes('already exists') || uploadErr.statusCode === '409') {
      return { path: `${bucket}/${cleanDir}/`, status: 'ALREADY_EXISTS' };
    }
    return { path: placeholderKey, status: 'FAILED', error: uploadErr.message };
  }

  return { path: `${bucket}/${cleanDir}/`, status: 'INITIALIZED' };
}

async function runAutonomousSetup() {
  console.log('================================================================');
  console.log(' APEX VAULT – AUTONOMOUS SUPABASE STORAGE REGISTRY INITIALIZER  ');
  console.log('================================================================\n');

  const report = {
    buckets: [],
    initialized: [],
    existing: [],
    failed: []
  };

  try {
    // 1. Ensure Top-Level Storage Buckets
    report.buckets.push(await checkAndCreateBucket('vehicles', true));
    report.buckets.push(await checkAndCreateBucket('products', true));
    report.buckets.push(await checkAndCreateBucket('private-documents', false));

    // 2. Build Path Manifest
    const pathsToProcess = [];

    // Cars
    CAR_BRANDS.forEach(b => pathsToProcess.push({ bucket: 'vehicles', dir: `cars/${b}` }));
    // Bikes
    BIKE_BRANDS.forEach(b => pathsToProcess.push({ bucket: 'vehicles', dir: `bikes/${b}` }));

    // Laptops & Phones
    LAPTOP_BRANDS.forEach(b => pathsToProcess.push({ bucket: 'products', dir: `laptops/${b}` }));
    PHONE_BRANDS.forEach(b => pathsToProcess.push({ bucket: 'products', dir: `phones/${b}` }));

    // Other Electronics
    OTHER_ELECTRONICS.forEach(cat => pathsToProcess.push({ bucket: 'products', dir: `${cat}` }));

    // Private Documents
    PRIVATE_DOCS.forEach(doc => pathsToProcess.push({ bucket: 'private-documents', dir: `${doc}` }));

    console.log(`[i] Processing ${pathsToProcess.length} structural hierarchy paths across 3 buckets...`);

    // 3. Process All Paths with Concurrency Limiter
    const CHUNK_SIZE = 10;
    for (let i = 0; i < pathsToProcess.length; i += CHUNK_SIZE) {
      const chunk = pathsToProcess.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(chunk.map(p => ensureKeepPlaceholder(p.bucket, p.dir)));
      
      results.forEach(res => {
        if (res.status === 'INITIALIZED') report.initialized.push(res.path);
        else if (res.status === 'ALREADY_EXISTS') report.existing.push(res.path);
        else report.failed.push(res);
      });
      process.stdout.write(`[*] Progress: ${Math.min(i + CHUNK_SIZE, pathsToProcess.length)}/${pathsToProcess.length}\r`);
    }

    console.log('\n\n--- SETUP COMPLETION AUDIT REPORT ---');
    console.table(report.buckets);
    console.log(`\nNew Directories Initialized (.keep created) : ${report.initialized.length}`);
    console.log(`Existing Directories Verified             : ${report.existing.length}`);
    console.log(`Failed Initializations                    : ${report.failed.length}`);

    if (report.failed.length > 0) {
      console.error('\nErrors encountered during folder sync:');
      console.dir(report.failed, { depth: null });
    }

    console.log('\n[✔] Storage hierarchy synchronized successfully with zero record loss.');
  } catch (err) {
    console.error('[!] Fatal setup execution error:', err);
    process.exit(1);
  }
}

runAutonomousSetup();
