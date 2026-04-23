import { DomainError } from './domain-error';

export class ResourceNotFoundError extends DomainError {
  readonly code = 'RESOURCE_NOT_FOUND';
  constructor(resource: string, id?: string) {
    super(
      id
        ? `${resource} with id ${id} was not found`
        : `${resource} was not found`,
    );
  }
}

export class EmailAlreadyExistsError extends DomainError {
  readonly code = 'EMAIL_ALREADY_EXISTS';
  constructor() {
    super('A user with this email already exists');
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  constructor() {
    super('Invalid email or password');
  }
}

export class ForbiddenAccessError extends DomainError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';
  constructor(available: number, requested: number) {
    super(`Insufficient stock: available ${available}, requested ${requested}`);
  }
}

export class CategoryHasProductsError extends DomainError {
  readonly code = 'CATEGORY_HAS_PRODUCTS';
  constructor() {
    super('Cannot delete category while products are linked to it');
  }
}

export class ProductReferencedError extends DomainError {
  readonly code = 'PRODUCT_REFERENCED';
  constructor() {
    super('Cannot delete product that appears on existing orders');
  }
}

export class InvalidOrderStateError extends DomainError {
  readonly code = 'INVALID_ORDER_STATE';
  constructor(message: string) {
    super(message);
  }
}

export class ProductInactiveError extends DomainError {
  readonly code = 'PRODUCT_INACTIVE';
  constructor() {
    super('Inactive products cannot be added to orders');
  }
}

export class InvalidFileUploadError extends DomainError {
  readonly code = 'INVALID_FILE_UPLOAD';
  constructor(message: string) {
    super(message);
  }
}

export class BusinessRuleViolationError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  constructor(message: string) {
    super(message);
  }
}
