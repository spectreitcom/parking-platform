import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivateAdminUserCommand } from '../commands/activate-admin-user.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(ActivateAdminUserCommand)
export class ActivateAdminUserCommandHandler implements ICommandHandler<
  ActivateAdminUserCommand,
  void
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ActivateAdminUserCommand): Promise<void> {
    const { adminUserId, version } = command;

    const adminUser = await this.adminUserRepository.findById(adminUserId);

    if (!adminUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Admin user not found');
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!adminUser.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Admin user with id ${adminUserId} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(adminUser);
    adminUser.activate();

    await this.adminUserRepository.save(adminUser);
    adminUser.commit();
  }
}
