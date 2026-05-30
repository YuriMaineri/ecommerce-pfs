import { Module } from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  ORDER_REPOSITORY,
  PAYMENT_REPOSITORY,
  PRODUCT_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/injection-tokens';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { PrismaCategoryRepository } from '../../infrastructure/persistence/repositories/prisma-category.repository';
import { PrismaOrderRepository } from '../../infrastructure/persistence/repositories/prisma-order.repository';
import { PrismaPaymentRepository } from '../../infrastructure/persistence/repositories/prisma-payment.repository';
import { PrismaProductRepository } from '../../infrastructure/persistence/repositories/prisma-product.repository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaUserRepository,
    { provide: USER_REPOSITORY, useExisting: PrismaUserRepository },
    PrismaCategoryRepository,
    { provide: CATEGORY_REPOSITORY, useExisting: PrismaCategoryRepository },
    PrismaProductRepository,
    { provide: PRODUCT_REPOSITORY, useExisting: PrismaProductRepository },
    PrismaOrderRepository,
    { provide: ORDER_REPOSITORY, useExisting: PrismaOrderRepository },
    PrismaPaymentRepository,
    { provide: PAYMENT_REPOSITORY, useExisting: PrismaPaymentRepository },
  ],
  exports: [
    USER_REPOSITORY,
    CATEGORY_REPOSITORY,
    PRODUCT_REPOSITORY,
    ORDER_REPOSITORY,
    PAYMENT_REPOSITORY,
  ],
})
export class RepositoriesModule {}
