import { Module } from '@nestjs/common';
import { AddOrderItemUseCase } from '../../../application/use-cases/orders/add-order-item.use-case';
import { CheckoutOrderUseCase } from '../../../application/use-cases/orders/checkout-order.use-case';
import { CreateOrderUseCase } from '../../../application/use-cases/orders/create-order.use-case';
import { DeleteOrderUseCase } from '../../../application/use-cases/orders/delete-order.use-case';
import { GetOrderUseCase } from '../../../application/use-cases/orders/get-order.use-case';
import { ListOrdersUseCase } from '../../../application/use-cases/orders/list-orders.use-case';
import { RemoveOrderItemUseCase } from '../../../application/use-cases/orders/remove-order-item.use-case';
import { UpdateOrderItemUseCase } from '../../../application/use-cases/orders/update-order-item.use-case';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/orders/update-order-status.use-case';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories.module';
import { OrdersController } from './orders.controller';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    DeleteOrderUseCase,
    AddOrderItemUseCase,
    UpdateOrderItemUseCase,
    RemoveOrderItemUseCase,
    CheckoutOrderUseCase,
  ],
})
export class OrdersModule {}
