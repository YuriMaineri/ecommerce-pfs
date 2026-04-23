import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../../domain/entities/category.entity';

export class CategoryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  static fromDomain(c: Category): CategoryResponse {
    const dto = new CategoryResponse();
    dto.id = c.id;
    dto.name = c.name;
    dto.description = c.description;
    return dto;
  }
}
