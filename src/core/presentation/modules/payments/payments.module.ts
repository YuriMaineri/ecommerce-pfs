import { Module } from '@nestjs/common';
import { ProcessPaymentWebhookUseCase } from '../../../application/use-cases/payments/process-payment-webhook.use-case';
import { RepositoriesModule } from '../repositories.module';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [WebhooksController, GatewayController],
  providers: [ProcessPaymentWebhookUseCase, GatewayService],
})
export class PaymentsModule {}
