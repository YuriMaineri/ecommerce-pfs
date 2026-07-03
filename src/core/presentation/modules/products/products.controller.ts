import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CreateProductUseCase } from '../../../application/use-cases/products/create-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/products/delete-product.use-case';
import { GetProductUseCase } from '../../../application/use-cases/products/get-product.use-case';
import { ListDeletedProductsUseCase } from '../../../application/use-cases/products/list-deleted-products.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/products/list-products.use-case';
import { RestoreProductUseCase } from '../../../application/use-cases/products/restore-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/products/update-product.use-case';
import { UploadProductImageUseCase } from '../../../application/use-cases/products/upload-product-image.use-case';
import { UploadProductThumbnailUseCase } from '../../../application/use-cases/products/upload-product-thumbnail.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query';
import { PaginatedProductsResponse } from './dto/paginated-products.response';
import { ProductResponse } from './dto/product.response';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly uploadImage: UploadProductImageUseCase,
    private readonly uploadThumbnail: UploadProductThumbnailUseCase,
    private readonly listDeletedProducts: ListDeletedProductsUseCase,
    private readonly restoreProduct: RestoreProductUseCase,
  ) {}

  @Get('deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List soft-deleted products (ADMIN)' })
  async listDeleted(): Promise<ProductResponse[]> {
    const rows = await this.listDeletedProducts.execute();
    return rows.map(ProductResponse.fromDomain);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted product (ADMIN)' })
  async restore(@Param('id') id: string): Promise<ProductResponse> {
    const p = await this.restoreProduct.execute(id);
    return ProductResponse.fromDomain(p);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (ADMIN)' })
  async create(@Body() body: CreateProductDto): Promise<ProductResponse> {
    const p = await this.createProduct.execute(body);
    return ProductResponse.fromDomain(p);
  }

  @Get()

  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'List products (paginated + filters)' })
  async list(
    @Query() query: ListProductsQueryDto,
  ): Promise<PaginatedProductsResponse> {
    const result = await this.listProducts.execute({
      search: query.search,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      active: query.active === undefined ? undefined : query.active === 'true',
      sortBy: query.sortBy,
      order: query.order,
      page: query.page,
      pageSize: query.pageSize,
    });
    return {
      ...result,
      items: result.items.map(ProductResponse.fromDomain),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  async get(@Param('id') id: string): Promise<ProductResponse> {
    const p = await this.getProduct.execute(id);
    return ProductResponse.fromDomain(p);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (ADMIN)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponse> {
    const p = await this.updateProduct.execute({ id, ...body });
    return ProductResponse.fromDomain(p);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (ADMIN)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteProduct.execute(id);
  }

  @Post(':id/image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload product image (ADMIN)' })
  async image(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('file is required');
    }
    const p = await this.uploadImage.execute(id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    return ProductResponse.fromDomain(p);
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload product thumbnail (ADMIN)' })
  async thumbnail(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('file is required');
    }
    const p = await this.uploadThumbnail.execute(id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    return ProductResponse.fromDomain(p);
  }
}
