import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { SignInCommandHandler } from '../sign-in.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { PasswordService } from '../../ports/password.service';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignInCommand } from '../../commands/sign-in.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from 'src/shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { AppError } from 'src/shared/errors';

describe('SignInCommandHandler', () => {
  let handler: SignInCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<OrganizationUserRepository>;

    passwordService = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenService>;

    refreshTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;

    refreshTokenStorage = {
      insert: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenStorage>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInCommandHandler,
        {
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
        },
        { provide: PasswordService, useValue: passwordService },
        { provide: AccessTokenService, useValue: accessTokenService },
        { provide: RefreshTokenService, useValue: refreshTokenService },
        { provide: RefreshTokenStorage, useValue: refreshTokenStorage },
      ],
    }).compile();

    handler = module.get<SignInCommandHandler>(SignInCommandHandler);
  });

  it('should sign in successfully', async () => {
    const organizationUserId = randomUUID();
    const command = new SignInCommand(organizationUserId);

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hashed-password',
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    accessTokenService.createToken.mockReturnValue('access-token');
    refreshTokenService.createToken.mockReturnValue('refresh-token');

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(accessTokenService.createToken).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      organizationUserId,
      expect.any(String),
    );
  });

  it('should throw error if user not found', async () => {
    const organizationUserId = randomUUID();
    const command = new SignInCommand(organizationUserId);
    organizationUserRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });

  it('should throw error if user is not active', async () => {
    const organizationUserId = randomUUID();
    const command = new SignInCommand(organizationUserId);
    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('suspended@example.com'),
      OrganizationUserStatus.suspended(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hashed-password',
    );
    organizationUserRepository.findById.mockResolvedValue(organizationUser);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });
});
