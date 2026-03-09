import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ResetPasswordCommandHandler } from '../reset-password.command-handler';
import { ResetPasswordCommand } from '../../commands/reset-password.command';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { PasswordService } from '../../ports/password.service';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';

describe('ResetPasswordCommandHandler', () => {
  let handler: ResetPasswordCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    adminUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    eventPublisher = {
      mergeObjectContext: jest.fn((obj) => obj),
    } as any;

    resetPasswordTokenService = {
      createHash: jest.fn(),
    } as any;

    resetPasswordTokenStorage = {
      validate: jest.fn(),
    } as any;

    passwordService = {
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepository,
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
    const newPassword = 'new-password';
    const command = new ResetPasswordCommand(token, newPassword);
    const userId = randomUUID();
    const adminUser = new AdminUser(
      AdminId.fromString(userId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
      'old-hash',
    );

    resetPasswordTokenService.createHash.mockReturnValue('hashed-token');
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    adminUserRepository.findById.mockResolvedValue(adminUser);
    passwordService.create.mockResolvedValue('new-hash');

    const adminUserSpy = jest.spyOn(adminUser, 'changePassword');
    const commitSpy = jest.spyOn(adminUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(resetPasswordTokenService.createHash).toHaveBeenCalledWith(token);
    expect(resetPasswordTokenStorage.validate).toHaveBeenCalledWith(
      'hashed-token',
    );
    expect(adminUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(adminUser);
    expect(passwordService.create).toHaveBeenCalledWith(newPassword);
    expect(adminUserSpy).toHaveBeenCalledWith('new-hash');
    expect(adminUserRepository.save).toHaveBeenCalledWith(adminUser);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const command = new ResetPasswordCommand('invalid-token', 'password');
    resetPasswordTokenService.createHash.mockReturnValue('hashed-token');
    resetPasswordTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid reset password token'),
    );
  });

  it('should throw error if user not found', async () => {
    // Given
    const userId = randomUUID();
    const command = new ResetPasswordCommand('valid-token', 'password');
    resetPasswordTokenService.createHash.mockReturnValue('hashed-token');
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Admin user not found'),
    );
  });
});
