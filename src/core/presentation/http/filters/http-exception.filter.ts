import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();
    const status = exception.getStatus();
    const res = exception.getResponse();
    const message =
      typeof res === 'string'
        ? res
        : ((res as { message?: string | string[] }).message ??
          exception.message);
    response.status(status).json({
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: HttpStatus[status],
      message: Array.isArray(message) ? message.join(', ') : message,
      path: request.url,
    });
  }
}
