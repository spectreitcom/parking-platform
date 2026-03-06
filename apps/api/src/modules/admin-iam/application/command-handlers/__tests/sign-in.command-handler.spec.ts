import { SignInCommandHandler } from '../sign-in.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignInCommand } from '../../commands/sign-in.command';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';

describe('SignInCommandHandler', () => {
  let handler: SignInCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(() => {
    adminUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;
    accessTokenService = {
      createToken: jest.fn(),
    } as any;
    refreshTokenService = {
      createToken: jest.fn(),
    } as any;
    refreshTokenStorage = {
      insert: jest.fn(),
      invalidate: jest.fn(),
    } as any;

    handler = new SignInCommandHandler(
      adminUserRepository,
      accessTokenService,
      refreshTokenService,
      refreshTokenStorage,
    );
  });

  it('should sign in successfully when admin user is active', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SignInCommand(adminUserId);
    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('admin@example.com'),
      true,
      AdminDisplayName.fromString('Admin User'),
      AdminStatus.active(),
      AggregateVersion.one(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);
    accessTokenService.createToken.mockReturnValue('access-token');
    refreshTokenService.createToken.mockReturnValue('refresh-token');

    // When
    const result = await handler.execute(command);

    // Then
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(accessTokenService.createToken).toHaveBeenCalledWith(adminUserId);
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      expect.any(String),
    );
  });

  it('should throw AppError when admin user is not found', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SignInCommand(adminUserId);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });

  it('should throw AppError when admin user is not active', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SignInCommand(adminUserId);
    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('admin@example.com'),
      true,
      AdminDisplayName.fromString('Admin User'),
      AdminStatus.suspended(),
      AggregateVersion.one(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });
});
