import { HttpStatus } from '@nestjs/common';

export type AppErrorCode =
  | 'ENTITY_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'ALREADY_EXISTS'
  | 'WRONG_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'SIMPLE_ERROR';

export const codeToStatus: Record<AppErrorCode, number> = {
  ENTITY_NOT_FOUND: HttpStatus.NOT_FOUND,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  ALREADY_EXISTS: HttpStatus.BAD_REQUEST,
  WRONG_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  SIMPLE_ERROR: HttpStatus.BAD_REQUEST,
};

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message?: string,
  ) {
    super(message);
  }
}
