import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RefreshTokenCommandHandler } from '../refresh-token.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { RefreshTokenCommand } from '../../commands/refresh-token.command';
import { AppError } from 'src/shared/errors';
import { User } from '../../../domain/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { LoginProvider } from '../../../domain/value-objects/login-provider';

describe('RefreshTokenCommandHandler', () => {
  let handler: RefreshTokenCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenService>;
    refreshTokenService = {
      verifyToken: jest.fn(),
      createToken: jest.fn(),
    };
    refreshTokenStorage = {
      validate: jest.fn(),
      invalidate: jest.fn(),
      insert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenCommandHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: AccessTokenService,
          useValue: accessTokenService,
        },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenService,
        },
        {
          provide: RefreshTokenStorage,
          useValue: refreshTokenStorage,
        },
      ],
    }).compile();

    handler = module.get<RefreshTokenCommandHandler>(
      RefreshTokenCommandHandler,
    );
  });

  it('should refresh token successfully', async () => {
    // Given
    const oldRefreshToken = 'old-refresh-token';
    const command = new RefreshTokenCommand(oldRefreshToken);
    const userId = randomUUID();
    const refreshTokenId = randomUUID();
    const payload = { sub: userId, refreshTokenId };
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
    );
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    refreshTokenService.verifyToken.mockReturnValue(payload);
    refreshTokenStorage.validate.mockResolvedValue(true);
    userRepository.findById.mockResolvedValue(user);
    accessTokenService.createToken.mockReturnValue(newAccessToken);
    refreshTokenService.createToken.mockReturnValue(newRefreshToken);

    // When
    const result = await handler.execute(command);

    // Then
    expect(refreshTokenService.verifyToken).toHaveBeenCalledWith(
      oldRefreshToken,
    );
    expect(refreshTokenStorage.validate).toHaveBeenCalledWith(
      userId,
      refreshTokenId,
    );
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(accessTokenService.createToken).toHaveBeenCalledWith(userId);
    expect(refreshTokenService.createToken).toHaveBeenCalledWith(
      userId,
      expect.any(String),
    );
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(userId);
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      userId,
      expect.any(String),
    );
    expect(result).toEqual({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const command = new RefreshTokenCommand('invalid-token');
    refreshTokenService.verifyToken.mockReturnValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if token is not in storage', async () => {
    // Given
    const command = new RefreshTokenCommand('token');
    refreshTokenService.verifyToken.mockReturnValue({
      sub: randomUUID(),
      refreshTokenId: randomUUID(),
    });
    refreshTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if user not found', async () => {
    // Given
    const command = new RefreshTokenCommand('token');
    refreshTokenService.verifyToken.mockReturnValue({
      sub: randomUUID(),
      refreshTokenId: randomUUID(),
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    userRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });
});
