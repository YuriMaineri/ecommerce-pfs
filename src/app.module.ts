import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './core/infrastructure/config/env.validation';
import { CacheModule } from './core/infrastructure/cache/cache.module';
import { PrismaModule } from './core/infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './core/presentation/modules/auth/auth.module';
import { CategoriesModule } from './core/presentation/modules/categories/categories.module';
import { OrdersModule } from './core/presentation/modules/orders/orders.module';
import { PaymentsModule } from './core/presentation/modules/payments/payments.module';
import { ProductsModule } from './core/presentation/modules/products/products.module';
import { UsersModule } from './core/presentation/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
