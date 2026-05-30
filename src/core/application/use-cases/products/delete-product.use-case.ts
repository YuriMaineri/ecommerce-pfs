import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ResourceNotFoundError('Product', id);
    }
    // Exclusao logica: segura mesmo que o produto ja apareca em pedidos,
    // pois a linha permanece no banco (apenas marcada como excluida).
    await this.products.delete(id);
  }
}
