import { v4 as uuidv4 } from 'uuid';
import { supabase, getSupabaseClient } from '../../lib/supabase.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface StorageUploadResult {
  publicUrl: string;
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Parses a base64 data URL into a Buffer, MIME type, and size.
 */
export function parseBase64DataUrl(dataUrl: string): { buffer: Buffer; mimeType: string; sizeBytes: number } {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data URL format. Expected data:<mime-type>;base64,<encoded-data>');
  }

  const mimeType = matches[1].toLowerCase();
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const sizeBytes = buffer.length;

  return { buffer, mimeType, sizeBytes };
}

/**
 * Validates file MIME type and size according to challenge constraints.
 */
export function validateImageFile(mimeType: string, sizeBytes: number): void {
  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    throw new Error(
      `Unsupported file type: "${mimeType}". Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`
    );
  }
}

/**
 * Uploads a report image to the 'report-images' bucket in Supabase Storage.
 */
export async function uploadReportImage(
  data: Buffer | string,
  fileName: string = 'report_photo.jpg',
  userId: string = 'system',
  token?: string,
  explicitMimeType?: string
): Promise<StorageUploadResult> {
  let buffer: Buffer;
  let mimeType: string;
  let sizeBytes: number;

  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      const parsed = parseBase64DataUrl(data);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
      sizeBytes = parsed.sizeBytes;
    } else {
      buffer = Buffer.from(data, 'base64');
      mimeType = explicitMimeType || 'image/jpeg';
      sizeBytes = buffer.length;
    }
  } else {
    buffer = data;
    mimeType = explicitMimeType || 'image/jpeg';
    sizeBytes = buffer.length;
  }

  validateImageFile(mimeType, sizeBytes);

  const ext = mimeType.split('/')[1] || 'jpg';
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `reports/${userId}/${Date.now()}-${uuidv4().substring(0, 8)}_${cleanFileName}.${ext}`;

  const client = getSupabaseClient(token);
  const { error } = await client.storage
    .from('report-images')
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload report image to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = client.storage
    .from('report-images')
    .getPublicUrl(storagePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath,
    sizeBytes,
    mimeType
  };
}

/**
 * Uploads a collection proof photo to the 'collection-proofs' bucket in Supabase Storage.
 */
export async function uploadCollectionProof(
  data: Buffer | string,
  fileName: string = 'proof_photo.jpg',
  assignmentId: string = 'asg-general',
  token?: string,
  explicitMimeType?: string
): Promise<StorageUploadResult> {
  let buffer: Buffer;
  let mimeType: string;
  let sizeBytes: number;

  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      const parsed = parseBase64DataUrl(data);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
      sizeBytes = parsed.sizeBytes;
    } else {
      buffer = Buffer.from(data, 'base64');
      mimeType = explicitMimeType || 'image/jpeg';
      sizeBytes = buffer.length;
    }
  } else {
    buffer = data;
    mimeType = explicitMimeType || 'image/jpeg';
    sizeBytes = buffer.length;
  }

  validateImageFile(mimeType, sizeBytes);

  const ext = mimeType.split('/')[1] || 'jpg';
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `proofs/${assignmentId}/${Date.now()}-${uuidv4().substring(0, 8)}_${cleanFileName}.${ext}`;

  const client = getSupabaseClient(token);
  const { error } = await client.storage
    .from('collection-proofs')
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload collection proof to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = client.storage
    .from('collection-proofs')
    .getPublicUrl(storagePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath,
    sizeBytes,
    mimeType
  };
}
