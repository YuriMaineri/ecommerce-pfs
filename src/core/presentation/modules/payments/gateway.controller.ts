import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayChargeDto } from './dto/gateway-charge.dto';
import { GatewayService } from './gateway.service';

@ApiTags('gateway (simulado)')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Post('charge')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Simula a cobranca no cartao e dispara o webhook' })
  charge(@Body() body: GatewayChargeDto): {
    status: string;
    reference: string;
  } {
    const approved = this.gateway.decideApproval(body.cardNumber);
    this.gateway.scheduleWebhook(body.reference, approved);

    return { status: 'processing', reference: body.reference };
  }
}
