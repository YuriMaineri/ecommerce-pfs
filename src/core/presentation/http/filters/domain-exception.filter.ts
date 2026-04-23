import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';

const codeToStatus: Record<string, HttpStatus> = {
  RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
  EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  CATEGORY_HAS_PRODUCTS: HttpStatus.CONFLICT,
  PRODUCT_REFERENCED: HttpStatus.CONFLICT,
  INVALID_ORDER_STATE: HttpStatus.BAD_REQUEST,
  PRODUCT_INACTIVE: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_FILE_UPLOAD: HttpStatus.BAD_REQUEST,
  BUSINESS_RULE_VIOLATION: HttpStatus.BAD_REQUEST,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();
    const status = codeToStatus[exception.code] ?? HttpStatus.BAD_REQUEST;
    response.status(status).json({
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: HttpStatus[status],
      message: exception.message,
      path: request.url,
    });
  }
}
