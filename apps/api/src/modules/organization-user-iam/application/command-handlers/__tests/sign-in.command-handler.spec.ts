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
      findByEmail: jest.fn(),
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
    const email = 'test@example.com';
    const password = 'password';
    const organizationUserId = randomUUID();
    const command = new SignInCommand(email, password);

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString(email),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hashed-password',
    );

    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);
    passwordService.compare.mockResolvedValue(true);
    accessTokenService.createToken.mockReturnValue('access-token');
    refreshTokenService.createToken.mockReturnValue('refresh-token');

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(passwordService.compare).toHaveBeenCalledWith(
      'hashed-password',
      password,
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
    const email = 'notfound@example.com';
    const command = new SignInCommand(email, 'password');
    organizationUserRepository.findByEmail.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });

  it('should throw error if user is not active', async () => {
    const email = 'suspended@example.com';
    const command = new SignInCommand(email, 'password');
    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(randomUUID()),
      Email.fromString(email),
      OrganizationUserStatus.suspended(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hashed-password',
    );
    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });

  it('should throw error if password is invalid', async () => {
    const email = 'test@example.com';
    const command = new SignInCommand(email, 'wrong-password');
    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(randomUUID()),
      Email.fromString(email),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hashed-password',
    );
    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);
    passwordService.compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });
});
