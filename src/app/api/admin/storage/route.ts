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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

    // 1. Audit Check: Database, Storage, and Environment Verification
    if (action === 'audit') {
      const auditReport: Record<string, any> = {
        timestamp: new Date().toISOString(),
        environment: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anonKey,
        },
        tables: {},
        storage_buckets: {},
        overall_status: 'HEALTHY',
        issues_detected: [] as string[],
      };

      // Check Database Tables
      const tablesToCheck = ['cars', 'bikes', 'gadgets'];
      for (const table of tablesToCheck) {
        try {
          const { data, count, error } = await supabase
            .from(table)
            .select('id, brand, model_name, thumbnail_url, gallery, colors', { count: 'exact', head: false })
            .limit(10);

          if (error) {
            auditReport.tables[table] = { status: 'FAILED', error: error.message };
            auditReport.issues_detected.push(`Table ${table} query failed: ${error.message}`);
            auditReport.overall_status = 'WARNING';
          } else {
            const inconsistencies: string[] = [];
            data?.forEach((item) => {
              if (!item.thumbnail_url) inconsistencies.push(`${item.model_name} missing thumbnail`);
              if (!item.gallery || item.gallery.length === 0) inconsistencies.push(`${item.model_name} empty gallery`);
            });

            auditReport.tables[table] = {
              status: 'OK',
              total_records: count,
              sample_checked: data?.length || 0,
              inconsistencies,
            };
          }
        } catch (err: any) {
          auditReport.tables[table] = { status: 'EXCEPTION', error: err.message };
          auditReport.issues_detected.push(`Exception querying table ${table}`);
        }
      }

      // Check Storage Buckets
      try {
        const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
        if (bucketErr) {
          auditReport.storage_buckets = { status: 'FAILED', error: bucketErr.message };
          auditReport.issues_detected.push(`Storage check failed: ${bucketErr.message}`);
          auditReport.overall_status = 'WARNING';
        } else {
          const expectedBuckets = ['vehicles', 'products', 'private-documents'];
          const foundBuckets = buckets?.map((b) => b.id) || [];
          const missing = expectedBuckets.filter((b) => !foundBuckets.includes(b));

          auditReport.storage_buckets = {
            status: missing.length === 0 ? 'OK' : 'MISSING_BUCKETS',
            active_buckets: foundBuckets,
            missing_buckets: missing,
          };
        }
      } catch (err: any) {
        auditReport.storage_buckets = { status: 'EXCEPTION', error: err.message };
      }

      return NextResponse.json(auditReport);
    }

    // 2. Storage Buckets Status
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

    // 3. Storage Folders Sync (.keep initialization)
    if (action === 'init') {
      const pathsToProcess: { bucket: string; dir: string }[] = [];

      CAR_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'vehicles', dir: `cars/${b}` }));
      BIKE_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'vehicles', dir: `bikes/${b}` }));
      LAPTOP_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'products', dir: `laptops/${b}` }));
      PHONE_BRANDS.forEach((b) => pathsToProcess.push({ bucket: 'products', dir: `phones/${b}` }));
      OTHER_ELECTRONICS_CATEGORIES.forEach((cat) => pathsToProcess.push({ bucket: 'products', dir: `${cat}` }));
      PRIVATE_DOC_DIRECTORIES.forEach((doc) => pathsToProcess.push({ bucket: 'private-documents', dir: `${doc}` }));

      const report = { initialized: 0, already_existed: 0, failed: 0 };

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
