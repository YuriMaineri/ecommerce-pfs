export interface UploadedFilePayload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface IFileStoragePort {
  saveProductImage(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string>;
  saveProductThumbnail(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<string>;
}
