import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RefreshTokenCommandHandler } from '../refresh-token.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { RefreshTokenCommand } from '../../commands/refresh-token.command';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from 'src/shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { AppError } from 'src/shared/errors';

describe('RefreshTokenCommandHandler', () => {
  let handler: RefreshTokenCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    adminUserRepository = {
      findById: jest.fn(),
    } as unknown as typeof adminUserRepository;

    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as typeof accessTokenService;

    refreshTokenService = {
      createToken: jest.fn(),
      verifyToken: jest.fn(),
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
          provide: AdminUserRepository,
          useValue: adminUserRepository,
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
    const adminUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'old-refresh-token';
    const command = new RefreshTokenCommand(refreshToken);
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
    );

    refreshTokenService.verifyToken.mockReturnValue({
      sub: adminUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    adminUserRepository.findById.mockResolvedValue(adminUser);
    accessTokenService.createToken.mockReturnValue(newAccessToken);
    refreshTokenService.createToken.mockReturnValue(newRefreshToken);

    // When
    const result = await handler.execute(command);

    // Then
    expect(refreshTokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
    expect(refreshTokenStorage.validate).toHaveBeenCalledWith(
      adminUserId,
      refreshTokenId,
    );
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(accessTokenService.createToken).toHaveBeenCalledWith(adminUserId);
    expect(refreshTokenService.createToken).toHaveBeenCalledWith(
      adminUserId,
      expect.any(String),
    );
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(adminUserId);
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      expect.any(String),
    );
    expect(result).toEqual({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const refreshToken = 'invalid-token';
    const command = new RefreshTokenCommand(refreshToken);

    refreshTokenService.verifyToken.mockReturnValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if token is not in storage', async () => {
    // Given
    const adminUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    refreshTokenService.verifyToken.mockReturnValue({
      sub: adminUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if admin user not found', async () => {
    // Given
    const adminUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    refreshTokenService.verifyToken.mockReturnValue({
      sub: adminUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if admin user is not active', async () => {
    // Given
    const adminUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.suspended(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
    );

    refreshTokenService.verifyToken.mockReturnValue({
      sub: adminUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });
});
