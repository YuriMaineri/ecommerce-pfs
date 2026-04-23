import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../../../domain/entities/product.entity';

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
    return dto;
  }
}
