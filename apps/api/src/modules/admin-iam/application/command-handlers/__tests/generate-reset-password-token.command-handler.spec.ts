import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { GenerateResetPasswordTokenCommandHandler } from '../generate-reset-password-token.command-handler';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { GenerateResetPasswordTokenCommand } from '../../commands/generate-reset-password-token.command';

describe('GenerateResetPasswordTokenCommandHandler', () => {
  let handler: GenerateResetPasswordTokenCommandHandler;
  let resetPasswordService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;

  beforeEach(async () => {
    resetPasswordService = {
      createHash: jest.fn(),
    } as unknown as typeof resetPasswordService;

    resetPasswordTokenStorage = {
      insert: jest.fn(),
    } as unknown as typeof resetPasswordTokenStorage;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateResetPasswordTokenCommandHandler,
        {
          provide: ResetPasswordTokenService,
          useValue: resetPasswordService,
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

  it('should generate reset password token, hash it and store it', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new GenerateResetPasswordTokenCommand(adminUserId);
    const expectedHash = 'hashed-token';
    resetPasswordService.createHash.mockReturnValue(expectedHash);

    // When
    const result = await handler.execute(command);

    // Then
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);

    expect(resetPasswordService.createHash).toHaveBeenCalledWith(result);
    expect(resetPasswordTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      expectedHash,
    );
  });
});
