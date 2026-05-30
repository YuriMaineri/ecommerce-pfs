import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Referencia do pagamento criada no checkout' })
  @IsString()
  @MinLength(1)
  reference!: string;

  @ApiProperty({ enum: ['approved', 'declined'] })
  @IsIn(['approved', 'declined'])
  status!: 'approved' | 'declined';
}
