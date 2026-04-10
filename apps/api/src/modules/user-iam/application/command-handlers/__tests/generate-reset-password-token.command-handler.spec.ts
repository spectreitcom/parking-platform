import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { GenerateResetPasswordTokenCommandHandler } from '../generate-reset-password-token.command-handler';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { GenerateResetPasswordTokenCommand } from '../../commands/generate-reset-password-token.command';

jest.mock('node:crypto', () => {
  const actual = jest.requireActual('node:crypto') as unknown as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    randomUUID: jest.fn(),
  };
});

describe('GenerateResetPasswordTokenCommandHandler', () => {
  let handler: GenerateResetPasswordTokenCommandHandler;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;

  beforeEach(async () => {
    resetPasswordTokenService = {
      createHash: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordTokenService>;
    resetPasswordTokenStorage = {
      insert: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordTokenStorage>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateResetPasswordTokenCommandHandler,
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

    handler = module.get<GenerateResetPasswordTokenCommandHandler>(
      GenerateResetPasswordTokenCommandHandler,
    );
  });

  it('should generate reset password token successfully', async () => {
    // Given
    const userId = 'user-id';
    const command = new GenerateResetPasswordTokenCommand(userId);
    const token = 'generated-token';
    const tokenHash = 'hashed-token';

    (randomUUID as jest.Mock).mockReturnValue(token);
    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);

    // When
    const result = await handler.execute(command);

    // Then
    expect(randomUUID).toHaveBeenCalled();
    expect(resetPasswordTokenService.createHash).toHaveBeenCalledWith(token);
    expect(resetPasswordTokenStorage.insert).toHaveBeenCalledWith(
      userId,
      tokenHash,
    );
    expect(result).toBe(token);
  });
});
