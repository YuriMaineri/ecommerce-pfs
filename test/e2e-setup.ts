import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { FILE_STORAGE } from '../src/core/application/injection-tokens';
import {
  IFileStoragePort,
  UploadedFilePayload,
} from '../src/core/application/ports/file-storage.port';
import { DomainExceptionFilter } from '../src/core/presentation/http/filters/domain-exception.filter';
import { HttpExceptionLoggingFilter } from '../src/core/presentation/http/filters/http-exception.filter';

const e2eStorageBucket = () =>
  process.env.SUPABASE_STORAGE_BUCKET ?? 'productsImages';

const e2eFileStorage: IFileStoragePort = {
  saveProductImage: async (productId: string, file: UploadedFilePayload) => {
    const ext = file.mimetype.toLowerCase().includes('png') ? '.png' : '.jpg';
    return `https://e2e.test/storage/v1/object/public/${e2eStorageBucket()}/${productId}/image${ext}`;
  },
  saveProductThumbnail: async (productId: string, file: UploadedFilePayload) => {
    const ext = file.mimetype.toLowerCase().includes('png') ? '.png' : '.jpg';
    return `https://e2e.test/storage/v1/object/public/${e2eStorageBucket()}/${productId}/thumbnail${ext}`;
  },
};

export async function createE2eApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(FILE_STORAGE)
    .useValue(e2eFileStorage)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new HttpExceptionLoggingFilter(),
  );
  await app.init();
  return app;
}
