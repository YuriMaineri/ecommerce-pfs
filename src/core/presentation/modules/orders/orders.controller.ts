import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddOrderItemUseCase } from '../../../application/use-cases/orders/add-order-item.use-case';
import { CreateOrderUseCase } from '../../../application/use-cases/orders/create-order.use-case';
import { DeleteOrderUseCase } from '../../../application/use-cases/orders/delete-order.use-case';
import { GetOrderUseCase } from '../../../application/use-cases/orders/get-order.use-case';
import { ListOrdersUseCase } from '../../../application/use-cases/orders/list-orders.use-case';
import { RemoveOrderItemUseCase } from '../../../application/use-cases/orders/remove-order-item.use-case';
import { UpdateOrderItemUseCase } from '../../../application/use-cases/orders/update-order-item.use-case';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/orders/update-order-status.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  CurrentUser,
  AuthUserPayload,
} from '../../decorators/current-user.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { OrderResponse } from './dto/order.response';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly listOrders: ListOrdersUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly deleteOrder: DeleteOrderUseCase,
    private readonly addItem: AddOrderItemUseCase,
    private readonly updateItem: UpdateOrderItemUseCase,
    private readonly removeItem: RemoveOrderItemUseCase,
  ) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create empty order (CUSTOMER)' })
  async create(@CurrentUser() actor: AuthUserPayload): Promise<OrderResponse> {
    const o = await this.createOrder.execute(actor.userId);
    return OrderResponse.fromDomain(o);
  }

  @Get()
  @ApiOperation({ summary: 'List orders (own or all for ADMIN)' })
  async list(@CurrentUser() actor: AuthUserPayload): Promise<OrderResponse[]> {
    const rows = await this.listOrders.execute(actor.userId, actor.role);
    return rows.map(OrderResponse.fromDomain);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (cancel rules apply)' })
  async patchStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<OrderResponse> {
    const o = await this.updateOrderStatus.execute({
      orderId: id,
      status: body.status,
      actorUserId: actor.userId,
      actorRole: actor.role,
    });
    return OrderResponse.fromDomain(o);
  }

  @Post(':orderId/items')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Add or increase line item (CUSTOMER)' })
  async addLine(
    @Param('orderId') orderId: string,
    @Body() body: AddOrderItemDto,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<OrderResponse> {
    const o = await this.addItem.execute({
      orderId,
      userId: actor.userId,
      productId: body.productId,
      quantity: body.quantity,
    });
    return OrderResponse.fromDomain(o);
  }

  @Put(':orderId/items/:itemId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Update line item quantity (CUSTOMER)' })
  async updateLine(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateOrderItemDto,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<OrderResponse> {
    const o = await this.updateItem.execute({
      orderId,
      userId: actor.userId,
      itemId,
      quantity: body.quantity,
    });
    return OrderResponse.fromDomain(o);
  }

  @Delete(':orderId/items/:itemId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Remove line item (CUSTOMER)' })
  async removeLine(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<OrderResponse> {
    const o = await this.removeItem.execute({
      orderId,
      userId: actor.userId,
      itemId,
    });
    return OrderResponse.fromDomain(o);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  async get(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<OrderResponse> {
    const o = await this.getOrder.execute(id, actor.userId, actor.role);
    return OrderResponse.fromDomain(o);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete order in CREATED status' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<void> {
    await this.deleteOrder.execute(id, actor.userId, actor.role);
  }
}
