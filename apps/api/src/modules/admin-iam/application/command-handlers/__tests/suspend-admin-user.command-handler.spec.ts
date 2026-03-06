import { EventPublisher } from '@nestjs/cqrs';
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

describe('DeactivateAdminUserCommandHandler', () => {
  let handler: SuspendAdminUserCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    adminUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;
    eventPublisher = {
      mergeObjectContext: jest.fn((obj) => obj),
    } as any;

    handler = new SuspendAdminUserCommandHandler(
      adminUserRepository,
      eventPublisher,
    );
  });

  it('should deactivate (suspense) admin user successfully', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const version = 1;
    const command = new SuspendAdminUserCommand(adminUserId, version);
    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('admin@example.com'),
      false,
      AdminDisplayName.fromString('Admin User'),
      AdminStatus.active(),
      AggregateVersion.fromNumber(version),
    );

    jest.spyOn(adminUser, 'suspense');
    jest.spyOn(adminUser, 'commit');
    adminUserRepository.findById.mockResolvedValue(adminUser);

    // When
    await handler.execute(command);

    // Then
    expect(adminUserRepository.findById).toHaveBeenCalledWith(adminUserId);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(adminUser);
    expect(adminUser.suspense).toHaveBeenCalled();
    expect(adminUserRepository.save).toHaveBeenCalledWith(adminUser);
    expect(adminUser.commit).toHaveBeenCalled();
  });

  it('should throw AppError when admin user not found', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SuspendAdminUserCommand(adminUserId, 1);
    adminUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Admin user not found'),
    );
  });

  it('should throw AppError when version mismatch (concurrency error)', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const commandVersion = 1;
    const aggregateVersion = 2;
    const command = new SuspendAdminUserCommand(adminUserId, commandVersion);
    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString('admin@example.com'),
      false,
      AdminDisplayName.fromString('Admin User'),
      AdminStatus.active(),
      AggregateVersion.fromNumber(aggregateVersion),
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
