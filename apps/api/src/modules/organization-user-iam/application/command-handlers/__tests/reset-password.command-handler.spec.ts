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
import { Email } from 'src/shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { AppError } from 'src/shared/errors';
import { OrganizationUserPasswordChangedEvent } from '../../../domain/events/organization-user-password-changed.event';
import { OrganizationUserActivatedEvent } from '../../../domain/events/organization-user-activated.event';

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
      findByEmail: jest.fn(),
    };

    eventPublisher = {
      mergeObjectContext: jest.fn((obj: unknown) => obj),
    } as unknown as jest.Mocked<EventPublisher>;

    resetPasswordTokenService = {
      createHash: jest.fn(),
    };

    resetPasswordTokenStorage = {
      validate: jest.fn(),
      invalidate: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordTokenStorage>;

    passwordService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

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

  it('should reset password successfully for an active user', async () => {
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

    const applySpy = jest.spyOn(organizationUser, 'apply');
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
    expect(
      organizationUser.getStatus().equals(OrganizationUserStatus.active()),
    ).toBe(true);
    expect(applySpy).toHaveBeenCalledWith(
      new OrganizationUserPasswordChangedEvent(userId),
    );
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should reset password and activate user if status is invited', async () => {
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
      OrganizationUserStatus.invited(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    passwordService.create.mockResolvedValue(newPasswordHash);

    const applySpy = jest.spyOn(organizationUser, 'apply');
    const activateSpy = jest.spyOn(organizationUser, 'activate');
    const commitSpy = jest.spyOn(organizationUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(
      organizationUser.getStatus().equals(OrganizationUserStatus.active()),
    ).toBe(true);
    expect(activateSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalledWith(
      new OrganizationUserPasswordChangedEvent(userId),
    );
    expect(applySpy).toHaveBeenCalledWith(
      new OrganizationUserActivatedEvent(userId),
    );
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
    );
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should reset password but keep status suspended if user is suspended', async () => {
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
      OrganizationUserStatus.suspended(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    passwordService.create.mockResolvedValue(newPasswordHash);

    const applySpy = jest.spyOn(organizationUser, 'apply');
    const activateSpy = jest.spyOn(organizationUser, 'activate');
    const commitSpy = jest.spyOn(organizationUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(
      organizationUser.getStatus().equals(OrganizationUserStatus.suspended()),
    ).toBe(true);
    expect(activateSpy).not.toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalledWith(
      new OrganizationUserPasswordChangedEvent(userId),
    );
    expect(applySpy).not.toHaveBeenCalledWith(
      expect.any(OrganizationUserActivatedEvent),
    );
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
    );
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
