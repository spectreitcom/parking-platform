import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RefreshTokenCommandHandler } from '../refresh-token.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { RefreshTokenCommand } from '../../commands/refresh-token.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from 'src/shared/value-objects/email';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { AppError } from 'src/shared/errors';

describe('RefreshTokenCommandHandler', () => {
  let handler: RefreshTokenCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<OrganizationUserRepository>;

    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenService>;

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
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
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
    const organizationUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'old-refresh-token';
    const command = new RefreshTokenCommand(refreshToken);
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    refreshTokenService.verifyToken.mockReturnValue({
      sub: organizationUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    accessTokenService.createToken.mockReturnValue(newAccessToken);
    refreshTokenService.createToken.mockReturnValue(newRefreshToken);

    // When
    const result = await handler.execute(command);

    // Then
    expect(refreshTokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
    expect(refreshTokenStorage.validate).toHaveBeenCalledWith(
      organizationUserId,
      refreshTokenId,
    );
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(accessTokenService.createToken).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(refreshTokenService.createToken).toHaveBeenCalledWith(
      organizationUserId,
      expect.any(String),
    );
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      organizationUserId,
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
    const organizationUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    refreshTokenService.verifyToken.mockReturnValue({
      sub: organizationUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if organization user not found', async () => {
    // Given
    const organizationUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    refreshTokenService.verifyToken.mockReturnValue({
      sub: organizationUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });

  it('should throw error if organization user is not active', async () => {
    // Given
    const organizationUserId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = 'refresh-token';
    const command = new RefreshTokenCommand(refreshToken);

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.suspended(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    refreshTokenService.verifyToken.mockReturnValue({
      sub: organizationUserId,
      refreshTokenId,
    });
    refreshTokenStorage.validate.mockResolvedValue(true);
    organizationUserRepository.findById.mockResolvedValue(organizationUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid refresh token'),
    );
  });
});
