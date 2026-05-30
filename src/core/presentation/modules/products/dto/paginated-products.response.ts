import { ApiProperty } from '@nestjs/swagger';
import { ProductResponse } from './product.response';

export class PaginatedProductsResponse {
  @ApiProperty({ type: [ProductResponse] })
  items!: ProductResponse[];

  @ApiProperty({ description: 'Total de itens que atendem ao filtro' })
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalPages!: number;
}
