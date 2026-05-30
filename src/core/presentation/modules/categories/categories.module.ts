import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../../application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from '../../../application/use-cases/categories/delete-category.use-case';
import { GetCategoryUseCase } from '../../../application/use-cases/categories/get-category.use-case';
import { ListCategoriesUseCase } from '../../../application/use-cases/categories/list-categories.use-case';
import { ListDeletedCategoriesUseCase } from '../../../application/use-cases/categories/list-deleted-categories.use-case';
import { RestoreCategoryUseCase } from '../../../application/use-cases/categories/restore-category.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/categories/update-category.use-case';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories.module';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    ListDeletedCategoriesUseCase,
    RestoreCategoryUseCase,
  ],
})
export class CategoriesModule {}
