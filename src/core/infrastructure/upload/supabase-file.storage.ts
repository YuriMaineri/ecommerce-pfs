import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IFileStoragePort,
  UploadedFilePayload,
} from '../../application/ports/file-storage.port';

@Injectable()
export class SupabaseFileStorage implements IFileStoragePort {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('SUPABASE_URL');
    const key = config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = config.getOrThrow<string>('SUPABASE_STORAGE_BUCKET');
    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async saveProductImage(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string> {
    return this.upload(productId, 'image', file);
  }

  async saveProductThumbnail(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string> {
    return this.upload(productId, 'thumbnail', file);
  }

  private async upload(
    productId: string,
    kind: 'image' | 'thumbnail',
    file: UploadedFilePayload,
  ): Promise<string> {
    const ext = this.extensionFromMime(file.mimetype);
    const objectPath = `${productId}/${kind}-${Date.now()}${ext}`;
    const { error } = await this.client.storage.from(this.bucket).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) {
      const msg = error.message ?? String(error);
      if (msg.includes('row-level security') || msg.includes('RLS')) {
        throw new Error(
          `Supabase storage upload blocked (RLS). Set SUPABASE_SERVICE_ROLE_KEY to the service_role secret (not anon). Bucket: ${this.bucket}.`,
        );
      }
      throw new Error(`Supabase storage upload failed: ${msg}`);
    }
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  private extensionFromMime(mime: string): string {
    const m = mime.toLowerCase();
    if (m.includes('png')) return '.png';
    if (m.includes('webp')) return '.webp';
    return '.jpg';
  }
}
