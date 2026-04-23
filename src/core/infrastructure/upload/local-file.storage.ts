import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  IFileStoragePort,
  UploadedFilePayload,
} from '../../application/ports/file-storage.port';

@Injectable()
export class LocalFileStorage implements IFileStoragePort {
  private baseDir(): string {
    return join(process.cwd(), 'uploads');
  }

  async saveProductImage(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string> {
    return this.save(productId, 'image', file);
  }

  async saveProductThumbnail(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string> {
    return this.save(productId, 'thumbnail', file);
  }

  private async save(
    productId: string,
    kind: 'image' | 'thumbnail',
    file: UploadedFilePayload,
  ): Promise<string> {
    const ext = this.extensionFromMime(file.mimetype);
    const dir = join(this.baseDir(), 'products', productId);
    await mkdir(dir, { recursive: true });
    const filename = `${kind}-${Date.now()}${ext}`;
    const absolutePath = join(dir, filename);
    await writeFile(absolutePath, file.buffer);
    return `/uploads/products/${productId}/${filename}`;
  }

  private extensionFromMime(mime: string): string {
    const m = mime.toLowerCase();
    if (m.includes('png')) return '.png';
    if (m.includes('webp')) return '.webp';
    return '.jpg';
  }
}
