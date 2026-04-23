import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from '../../../application/use-cases/categories/delete-category.use-case';
import { GetCategoryUseCase } from '../../../application/use-cases/categories/get-category.use-case';
import { ListCategoriesUseCase } from '../../../application/use-cases/categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/categories/update-category.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CategoryResponse } from './dto/category.response';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (ADMIN)' })
  async create(@Body() body: CreateCategoryDto): Promise<CategoryResponse> {
    const c = await this.createCategory.execute(body);
    return CategoryResponse.fromDomain(c);
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  async list(): Promise<CategoryResponse[]> {
    const rows = await this.listCategories.execute();
    return rows.map(CategoryResponse.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  async get(@Param('id') id: string): Promise<CategoryResponse> {
    const c = await this.getCategory.execute(id);
    return CategoryResponse.fromDomain(c);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (ADMIN)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const c = await this.updateCategory.execute({ id, ...body });
    return CategoryResponse.fromDomain(c);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (ADMIN)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteCategory.execute(id);
  }
}
