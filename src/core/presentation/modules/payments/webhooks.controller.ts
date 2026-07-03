import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcessPaymentWebhookUseCase } from '../../../application/use-cases/payments/process-payment-webhook.use-case';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly processWebhook: ProcessPaymentWebhookUseCase,
    private readonly config: ConfigService,
  ) {}

  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de resultado de pagamento (gateway -> backend)' })
  async payments(
    @Body() body: PaymentWebhookDto,
    @Headers('x-webhook-token') token?: string,
  ): Promise<{ received: boolean; orderStatus: string; alreadyProcessed: boolean }> {
    const expected = this.config.get<string>('PAYMENT_WEBHOOK_TOKEN');

    if (expected && token !== expected) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    const result = await this.processWebhook.execute({
      reference: body.reference,
      approved: body.status === 'approved',
    });

    return {
      received: true,
      orderStatus: result.order.status,
      alreadyProcessed: result.alreadyProcessed,
    };
  }
}
