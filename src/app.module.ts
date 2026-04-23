import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './core/infrastructure/config/env.validation';
import { PrismaModule } from './core/infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './core/presentation/modules/auth/auth.module';
import { CategoriesModule } from './core/presentation/modules/categories/categories.module';
import { OrdersModule } from './core/presentation/modules/orders/orders.module';
import { ProductsModule } from './core/presentation/modules/products/products.module';
import { UsersModule } from './core/presentation/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
