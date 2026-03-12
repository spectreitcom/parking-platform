import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
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

  beforeEach(async () => {
    adminUserRepository = {
      findById: jest.fn(),
    } as unknown as typeof adminUserRepository;

    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as typeof accessTokenService;

    refreshTokenService = {
      createToken: jest.fn(),
    } as unknown as typeof refreshTokenService;

    refreshTokenStorage = {
      insert: jest.fn(),
    } as unknown as typeof refreshTokenStorage;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInCommandHandler,
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

    handler = module.get<SignInCommandHandler>(SignInCommandHandler);
  });

  it('should sign in successfully', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SignInCommand(adminUserId);
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);
    accessTokenService.createToken.mockReturnValue(accessToken);
    refreshTokenService.createToken.mockReturnValue(refreshToken);
    refreshTokenStorage.insert.mockResolvedValue();

    // When
    const result = await handler.execute(command);

    // Then
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(accessTokenService.createToken).toHaveBeenCalledWith(adminUserId);
    expect(refreshTokenService.createToken).toHaveBeenCalledWith(
      adminUserId,
      expect.any(String),
    );
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      expect.any(String),
    );
    expect(result).toEqual({
      accessToken,
      refreshToken,
    });
  });

  it('should throw error if admin user not found', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SignInCommand(adminUserId);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });

  it('should throw error if admin user is not active', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SignInCommand(adminUserId);

    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.suspended(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });
});
