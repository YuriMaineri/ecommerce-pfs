import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../../../domain/entities/product.entity';
import { CategoryResponse } from '../../categories/dto/category.response';

export class ProductResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  image!: string;

  @ApiProperty()
  thumbnail!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  categoryId!: string;

  @ApiPropertyOptional({ type: CategoryResponse })
  category?: CategoryResponse;

  static fromDomain(p: Product): ProductResponse {
    const dto = new ProductResponse();
    dto.id = p.id;
    dto.name = p.name;
    dto.description = p.description;
    dto.image = p.image;
    dto.thumbnail = p.thumbnail;
    dto.stock = p.stock;
    dto.price = p.price;
    dto.active = p.active;
    dto.createdAt = p.createdAt;
    dto.categoryId = p.categoryId;
    if (p.category) {
      dto.category = CategoryResponse.fromDomain(p.category);
    }
    return dto;
  }
}
