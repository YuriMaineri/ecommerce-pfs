import { InsufficientStockError } from '../errors/application.errors';
import { Product } from './product.entity';

describe('Product entity rules', () => {
  const base = () =>
    new Product('p1', 'Item', 'Desc', '', '', 3, 10, true, new Date(), 'c1');

  it('rejects negative stock invariant', () => {
    const p = base();
    p.stock = -1;
    expect(() => p.assertNonNegativeStock()).toThrow();
  });

  it('rejects non-positive price', () => {
    const p = base();
    p.price = 0;
    expect(() => p.assertPositivePrice()).toThrow();
  });

  it('rejects quantity below 1', () => {
    const p = base();
    expect(() => p.assertAvailableQuantity(0)).toThrow();
  });

  it('throws InsufficientStockError when stock too low', () => {
    const p = base();
    expect(() => p.assertAvailableQuantity(10)).toThrow(InsufficientStockError);
  });
});
