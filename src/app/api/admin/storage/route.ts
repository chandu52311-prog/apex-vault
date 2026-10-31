import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CAR_BRANDS,
  BIKE_BRANDS,
  LAPTOP_BRANDS,
  PHONE_BRANDS,
  OTHER_ELECTRONICS_CATEGORIES,
  PRIVATE_DOC_DIRECTORIES,
  generateVehiclePath,
  generateProductPath,
  generatePrivateDocumentPath,
} from '@/lib/storage-registry';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration missing in environment variables.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';

    // 1. Check Status
    if (action === 'status') {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        success: true,
        buckets: buckets.map((b) => ({
          id: b.id,
          name: b.name,
          public: b.public,
          created_at: b.created_at,
        })),
      });
    }

    // 2. Direct Browser Trigger to Initialize all 10,000+ brand/model paths with .keep
    if (action === 'init') {
      const pathsToProcess: { bucket: string; dir: string }[] = [];

      CAR_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'vehicles', dir: `cars/${b}` }));
      BIKE_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'vehicles', dir: `bikes/${b}` }));
      LAPTOP_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'products', dir: `laptops/${b}` }));
      PHONE_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'products', dir: `phones/${b}` }));
      OTHER_ELECTRONICS_CATEGORIES.forEach((cat) => pathsToProcess.push({ bucket: 'products', dir: `${cat}` }));
      PRIVATE_DOC_DIRECTORIES.forEach((doc) => pathsToProcess.push({ bucket: 'private-documents', dir: `${doc}` }));

      const report = {
        initialized: 0,
        already_existed: 0,
        failed: 0,
      };

      for (const item of pathsToProcess) {
        const cleanDir = item.dir.replace(/^\/+|\/+$/g, '');
        const placeholderKey = `${cleanDir}/.keep`;

        const { data: list } = await supabase.storage.from(item.bucket).list(cleanDir, { limit: 1 });

        if (list && list.length > 0) {
          report.already_existed++;
          continue;
        }

        const { error: uploadErr } = await supabase.storage
          .from(item.bucket)
          .upload(placeholderKey, Buffer.from(''), {
            contentType: 'application/octet-stream',
            upsert: false,
          });

        if (uploadErr) {
          if (uploadErr.message.includes('already exists')) {
            report.already_existed++;
          } else {
            report.failed++;
          }
        } else {
          report.initialized++;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Storage hierarchy synchronization completed.',
        report,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();
    const { type, payload } = body;

    let computedPath = '';

    if (type === 'resolve_vehicle_path') {
      computedPath = generateVehiclePath(payload);
    } else if (type === 'resolve_product_path') {
      computedPath = generateProductPath(payload);
    } else if (type === 'resolve_private_path') {
      computedPath = generatePrivateDocumentPath(payload.docType, payload.entityId);
    } else {
      return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }

    const targetBucket = computedPath.split('/')[0];
    const internalDir = computedPath.substring(targetBucket.length + 1).replace(/\/$/, '');

    const { data: existingFiles } = await supabase.storage.from(targetBucket).list(internalDir, { limit: 1 });

    let isNew = false;
    if (!existingFiles || existingFiles.length === 0) {
      await supabase.storage.from(targetBucket).upload(`${internalDir}/.keep`, Buffer.from(''), {
        contentType: 'application/octet-stream',
        upsert: false,
      });
      isNew = true;
    }

    return NextResponse.json({
      success: true,
      bucket: targetBucket,
      storage_path: computedPath,
      internal_dir: internalDir,
      is_new_path: isNew,
      public_base_url:
        targetBucket !== 'private-documents'
          ? `${supabaseUrl}/storage/v1/object/public/${computedPath}`
          : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
