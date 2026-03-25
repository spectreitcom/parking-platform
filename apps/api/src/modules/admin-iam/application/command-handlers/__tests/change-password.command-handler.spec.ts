import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ChangePasswordCommandHandler } from '../change-password.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { ChangePasswordCommand } from '../../commands/change-password.command';
import { PasswordService } from '../../ports/password.service';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from 'src/shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { AppError } from 'src/shared/errors';

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    adminUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<AdminUserRepository>;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as jest.Mocked<EventPublisher>;

    passwordService = {
      compare: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    handler = module.get<ChangePasswordCommandHandler>(
      ChangePasswordCommandHandler,
    );
  });

  it('should change password successfully', async () => {
    // Given
    const adminUserId = randomUUID();
    const existingPassword = 'old-password';
    const newPassword = 'new-password';
    const oldHash = 'old-hash';
    const newHash = 'new-hash';

    const command = new ChangePasswordCommand(
      adminUserId,
      existingPassword,
      newPassword,
    );

    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
      oldHash,
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);
    passwordService.compare.mockResolvedValue(true);
    passwordService.create.mockResolvedValue(newHash);
    const commitSpy = jest.spyOn(adminUser, 'commit');
    const changePasswordSpy = jest.spyOn(adminUser, 'changePassword');

    // When
    await handler.execute(command);

    // Then
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(adminUser);
    expect(passwordService.compare).toHaveBeenCalledWith(
      oldHash,
      existingPassword,
    );
    expect(passwordService.create).toHaveBeenCalledWith(newPassword);
    expect(changePasswordSpy).toHaveBeenCalledWith(newHash);
    expect(adminUserRepository.save).toHaveBeenCalledWith(adminUser);
    expect(commitSpy).toHaveBeenCalled();
    expect(adminUser.getPasswordHash()).toBe(newHash);
  });

  it('should throw error if admin user not found', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new ChangePasswordCommand(
      adminUserId,
      'old-password',
      'new-password',
    );

    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Admin user not found'),
    );
  });

  it('should throw error if existing password is invalid', async () => {
    // Given
    const adminUserId = randomUUID();
    const existingPassword = 'wrong-password';
    const command = new ChangePasswordCommand(
      adminUserId,
      existingPassword,
      'new-password',
    );

    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
      'old-hash',
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);
    passwordService.compare.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid existing password'),
    );
    expect(passwordService.compare).toHaveBeenCalledWith(
      'old-hash',
      existingPassword,
    );
    expect(passwordService.create).not.toHaveBeenCalled();
    expect(adminUserRepository.save).not.toHaveBeenCalled();
  });
});
