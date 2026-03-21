import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppErrorCode, codeToStatus } from './index';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(
    exception:
      | { code?: AppErrorCode; message?: string }
      | UnauthorizedException,
    host: ArgumentsHost,
  ) {
    this.logger.error(exception);

    const res: Response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      // Cast to HttpStatus enum to avoid unsafe enum comparison warnings
      const status: HttpStatus = exception.getStatus() as HttpStatus;

      // Explicit handling for auth/permission errors with constant messages
      if (status === HttpStatus.UNAUTHORIZED) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          title: 'UNAUTHORIZED',
          detail: 'Unauthorized',
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      if (status === HttpStatus.FORBIDDEN) {
        return res.status(HttpStatus.FORBIDDEN).json({
          title: 'FORBIDDEN',
          detail: 'Forbidden',
          status: HttpStatus.FORBIDDEN,
        });
      }

      // Hide details for server-side errors (5xx)
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return res.status(status).json({
          title: 'SERVER_ERROR',
          detail: 'Internal server error',
          status,
        });
      }

      // Default for other HttpExceptions (typically 4xx)
      return res.status(status).json({
        title: status.toString(),
        detail: exception.message,
        status,
      });
    }

    if (exception?.code && codeToStatus[exception.code]) {
      const status = codeToStatus[exception.code];
      return res.status(status).json({
        title: exception.code,
        detail: exception.message,
        status,
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      title: 'SERVER_ERROR',
      detail: 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
