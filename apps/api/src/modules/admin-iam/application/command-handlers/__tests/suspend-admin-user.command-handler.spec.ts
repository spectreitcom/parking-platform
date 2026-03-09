import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { SuspendAdminUserCommandHandler } from '../suspend-admin-user.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { SuspendAdminUserCommand } from '../../commands/suspend-admin-user.command';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';

describe('SuspendAdminUserCommandHandler', () => {
  let handler: SuspendAdminUserCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    adminUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    eventPublisher = {
      mergeObjectContext: jest.fn((obj) => obj),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuspendAdminUserCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<SuspendAdminUserCommandHandler>(
      SuspendAdminUserCommandHandler,
    );
  });

  it('should suspend admin user successfully', async () => {
    // Given
    const adminUserId = randomUUID();
    const version = 1;
    const command = new SuspendAdminUserCommand(adminUserId, version);

    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.fromNumber(version),
      new Date(),
      new Date(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When
    await handler.execute(command);

    // Then
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(adminUserRepository.save).toHaveBeenCalledWith(adminUser);
    expect(adminUser.getStatus().equals(AdminStatus.suspended())).toBe(true);
  });

  it('should throw error if admin user not found', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SuspendAdminUserCommand(adminUserId, 1);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Admin user not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SuspendAdminUserCommand(adminUserId, 1);

    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('test@example.com'),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.fromNumber(2),
      new Date(),
      new Date(),
    );

    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Admin user with id ${adminUserId} has been modified by another process`,
      ),
    );
  });
});
