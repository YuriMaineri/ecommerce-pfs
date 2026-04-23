import { Module } from '@nestjs/common';
import { CreateProductUseCase } from '../../../application/use-cases/products/create-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/products/delete-product.use-case';
import { GetProductUseCase } from '../../../application/use-cases/products/get-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/products/list-products.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/products/update-product.use-case';
import { UploadProductImageUseCase } from '../../../application/use-cases/products/upload-product-image.use-case';
import { UploadProductThumbnailUseCase } from '../../../application/use-cases/products/upload-product-thumbnail.use-case';
import { FILE_STORAGE } from '../../../application/injection-tokens';
import { LocalFileStorage } from '../../../infrastructure/upload/local-file.storage';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories.module';
import { ProductsController } from './products.controller';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [ProductsController],
  providers: [
    LocalFileStorage,
    { provide: FILE_STORAGE, useExisting: LocalFileStorage },
    CreateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UploadProductImageUseCase,
    UploadProductThumbnailUseCase,
  ],
})
export class ProductsModule {}
