import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangeOrganizationUserPasswordCommand } from '../commands/change-organization-user-password.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { AppError } from '../../../../shared/errors';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(ChangeOrganizationUserPasswordCommand)
export class ChangeOrganizationUserPasswordCommandHandler implements ICommandHandler<
  ChangeOrganizationUserPasswordCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: ChangeOrganizationUserPasswordCommand): Promise<void> {
    await this.transactionRunner.runInTransaction(async (prisma) => {
      const { organizationUserId, passwordHash, version } = command;

      const organizationUser = await this.organizationUserRepository.findById(
        organizationUserId,
        prisma,
      );

      if (!organizationUser) {
        throw new AppError('ENTITY_NOT_FOUND', 'Organization user not found');
      }

      const _version = AggregateVersion.fromNumber(version);

      if (!organizationUser.getVersion().equals(_version)) {
        throw new AppError(
          'CONCURRENCY',
          `Organization User with id ${organizationUserId} has been modified by another process`,
        );
      }

      this.eventPublisher.mergeObjectContext(organizationUser);

      organizationUser.changePassword(passwordHash);

      await this.organizationUserRepository.save(organizationUser, {
        isNew: false,
        tx: prisma,
      });

      organizationUser.commit();
    });
  }
}
