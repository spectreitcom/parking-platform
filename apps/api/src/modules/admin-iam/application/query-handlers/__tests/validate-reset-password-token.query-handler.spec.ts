import { Test, TestingModule } from '@nestjs/testing';
import { ValidateResetPasswordTokenQueryHandler } from '../validate-reset-password-token.query-handler';
import { ValidateResetPasswordTokenQuery } from '../../queries/validate-reset-password-token.query';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { AppError } from '../../../../../shared/errors';

describe('ValidateResetPasswordTokenQueryHandler', () => {
  let handler: ValidateResetPasswordTokenQueryHandler;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;

  beforeEach(async () => {
    resetPasswordTokenService = {
      createHash: jest.fn(),
    } as any;

    resetPasswordTokenStorage = {
      validate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateResetPasswordTokenQueryHandler,
        {
          provide: ResetPasswordTokenService,
          useValue: resetPasswordTokenService,
        },
        {
          provide: ResetPasswordTokenStorage,
          useValue: resetPasswordTokenStorage,
        },
      ],
    }).compile();

    handler = module.get<ValidateResetPasswordTokenQueryHandler>(
      ValidateResetPasswordTokenQueryHandler,
    );
  });

  it('should return true if token is valid', async () => {
    // Given
    const token = 'valid-token';
    const query = new ValidateResetPasswordTokenQuery(token);
    resetPasswordTokenService.createHash.mockReturnValue('hashed-token');
    resetPasswordTokenStorage.validate.mockResolvedValue('user-id');

    // When
    const result = await handler.execute(query);

    // Then
    expect(result).toBe(true);
    expect(resetPasswordTokenService.createHash).toHaveBeenCalledWith(token);
    expect(resetPasswordTokenStorage.validate).toHaveBeenCalledWith(
      'hashed-token',
    );
  });

  it('should throw error if token is missing', async () => {
    // Given
    const query = new ValidateResetPasswordTokenQuery('');

    // When & Then
    await expect(handler.execute(query)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Reset password token is required'),
    );
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const token = 'invalid-token';
    const query = new ValidateResetPasswordTokenQuery(token);
    resetPasswordTokenService.createHash.mockReturnValue('hashed-token');
    resetPasswordTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(query)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid reset password token'),
    );
  });
});
