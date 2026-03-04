import { HttpStatus } from '@nestjs/common';

export type AppErrorCode =
  | 'ENTITY_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'ALREADY_EXISTS'
  | 'WRONG_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'SIMPLE_ERROR'
  | 'CONCURRENCY'
  | 'FORBIDDEN_OPERATION';

export const codeToStatus: Record<AppErrorCode, number> = {
  ENTITY_NOT_FOUND: HttpStatus.NOT_FOUND,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  ALREADY_EXISTS: HttpStatus.BAD_REQUEST,
  WRONG_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  SIMPLE_ERROR: HttpStatus.BAD_REQUEST,
  CONCURRENCY: HttpStatus.CONFLICT,
  FORBIDDEN_OPERATION: HttpStatus.FORBIDDEN,
};

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message?: string,
  ) {
    super(message);
  }
}

export class ConcurrencyError extends Error {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} has been modified by another process`);
  }
}
