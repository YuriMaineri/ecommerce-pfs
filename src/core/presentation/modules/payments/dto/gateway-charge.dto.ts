import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class GatewayChargeDto {
  @ApiProperty({ description: 'Referencia do pagamento (retornada pelo checkout)' })
  @IsString()
  @MinLength(1)
  reference!: string;

  @ApiProperty({ description: 'Numero do cartao de teste', example: '4242 4242 4242 4242' })
  @IsString()
  @MinLength(1)
  cardNumber!: string;

  @ApiPropertyOptional({ description: 'Nome impresso no cartao' })
  @IsOptional()
  @IsString()
  cardName?: string;
}
