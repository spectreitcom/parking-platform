import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivateOrganizationUserCommand } from '../commands/activate-organization-user.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { AppError } from 'src/shared/errors';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';

@CommandHandler(ActivateOrganizationUserCommand)
export class ActivateOrganizationUserCommandHandler implements ICommandHandler<
  ActivateOrganizationUserCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: ActivateOrganizationUserCommand): Promise<void> {
    await this.transactionRunner.runInTransaction(async (prisma) => {
      const { organizationUserId, version } = command;

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

      organizationUser.activate();

      await this.organizationUserRepository.save(organizationUser, {
        isNew: false,
        tx: prisma,
      });

      organizationUser.commit();
    });
  }
}
