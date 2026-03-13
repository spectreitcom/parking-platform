import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ResetPasswordCommandHandler } from '../reset-password.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { PasswordService } from '../../ports/password.service';
import { ResetPasswordCommand } from '../../commands/reset-password.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from '../../../../../shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { AppError } from '../../../../../shared/errors';

describe('ResetPasswordCommandHandler', () => {
  let handler: ResetPasswordCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof organizationUserRepository;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

    resetPasswordTokenService = {
      createHash: jest.fn(),
    } as unknown as typeof resetPasswordTokenService;

    resetPasswordTokenStorage = {
      validate: jest.fn(),
      invalidate: jest.fn(),
    } as unknown as typeof resetPasswordTokenStorage;

    passwordService = {
      create: jest.fn(),
    } as unknown as typeof passwordService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCommandHandler,
        {
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: ResetPasswordTokenService,
          useValue: resetPasswordTokenService,
        },
        {
          provide: ResetPasswordTokenStorage,
          useValue: resetPasswordTokenStorage,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    handler = module.get<ResetPasswordCommandHandler>(
      ResetPasswordCommandHandler,
    );
  });

  it('should reset password successfully', async () => {
    // Given
    const token = 'valid-token';
    const newPassword = 'NewPassword123!';
    const command = new ResetPasswordCommand(token, newPassword);
    const userId = randomUUID();
    const tokenHash = 'hashed-token';
    const newPasswordHash = 'hashed-new-password';

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(userId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    passwordService.create.mockResolvedValue(newPasswordHash);

    const commitSpy = jest.spyOn(organizationUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(resetPasswordTokenService.createHash).toHaveBeenCalledWith(token);
    expect(resetPasswordTokenStorage.validate).toHaveBeenCalledWith(tokenHash);
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(resetPasswordTokenStorage.invalidate).toHaveBeenCalledWith(
      tokenHash,
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organizationUser,
    );
    expect(passwordService.create).toHaveBeenCalledWith(newPassword);
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
    );
    expect(organizationUser.getPasswordHash()).toBe(newPasswordHash);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const token = 'invalid-token';
    const command = new ResetPasswordCommand(token, 'password');
    const tokenHash = 'hashed-token';

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid reset password token'),
    );
    expect(organizationUserRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw error if user not found', async () => {
    // Given
    const token = 'valid-token';
    const command = new ResetPasswordCommand(token, 'password');
    const userId = randomUUID();
    const tokenHash = 'hashed-token';

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization user not found'),
    );
  });
});
