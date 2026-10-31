// src/app/api/admin/storage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  generateVehiclePath, 
  generateProductPath, 
  generatePrivateDocumentPath 
} from '@/lib/storage-registry';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase Server configuration missing in environment variables.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';
    const bucket = searchParams.get('bucket') || 'vehicles';
    const folder = searchParams.get('folder') || '';

    if (action === 'status') {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        success: true,
        buckets: buckets.map(b => ({
          id: b.id,
          name: b.name,
          public: b.public,
          created_at: b.created_at
        }))
      });
    }

    if (action === 'inspect') {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list(folder, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Identify duplicates or check URL signatures
      const fileReport = files.map(file => {
        let publicUrl = null;
        if (bucket !== 'private-documents') {
          const { data } = supabase.storage.from(bucket).getPublicUrl(`${folder}/${file.name}`.replace(/^\/+/, ''));
          publicUrl = data.publicUrl;
        }
        return {
          name: file.name,
          id: file.id,
          size_bytes: file.metadata?.size || 0,
          created_at: file.created_at,
          public_url: publicUrl
        };
      });

      return NextResponse.json({
        success: true,
        bucket,
        folder,
        total_files: files.length,
        files: fileReport
      });
    }

    return NextResponse.json({ error: 'Unsupported action requested' }, { status: 400 });
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

    // Determine target bucket
    const targetBucket = computedPath.split('/')[0];
    const internalDir = computedPath.substring(targetBucket.length + 1).replace(/\/$/, '');

    // Idempotent generation: check and write .keep if path is brand new
    const { data: existingFiles } = await supabase.storage.from(targetBucket).list(internalDir, { limit: 1 });

    let isNew = false;
    if (!existingFiles || existingFiles.length === 0) {
      await supabase.storage.from(targetBucket).upload(`${internalDir}/.keep`, Buffer.from(''), {
        contentType: 'application/octet-stream',
        upsert: false
      });
      isNew = true;
    }

    return NextResponse.json({
      success: true,
      bucket: targetBucket,
      storage_path: computedPath,
      internal_dir: internalDir,
      is_new_path: isNew,
      public_base_url: targetBucket !== 'private-documents'
        ? `${supabaseUrl}/storage/v1/object/public/${computedPath}`
        : null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
