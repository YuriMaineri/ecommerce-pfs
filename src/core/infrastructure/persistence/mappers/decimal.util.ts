import { Prisma } from '@prisma/client';

export function decimalToNumber(value: Prisma.Decimal | number): number {
  if (typeof value === 'number') {
    return value;
  }
  return value.toNumber();
}
