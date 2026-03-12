import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationUserCommand } from '../commands/update-organization-user.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { OutboxService } from '../../../../shared/outbox/outbox.service';
import { AppError } from '../../../../shared/errors';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { IntegrationEvent } from '../../../../shared/outbox/outbox.types';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamUpdatedV1Payload,
} from '../contracts/integration-events';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(UpdateOrganizationUserCommand)
export class UpdateOrganizationUserCommandHandler implements ICommandHandler<
  UpdateOrganizationUserCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: UpdateOrganizationUserCommand): Promise<void> {
    await this.transactionRunner.runInTransaction(async (prisma) => {
      const { organizationUserId, displayName, version } = command;

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

      organizationUser.update(displayName);

      await this.organizationUserRepository.save(organizationUser, {
        isNew: false,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        OrganizationUserIamUpdatedV1Payload,
        OrganizationUserIamIntegrationEventTypes
      >(
        'organization-user-iam.organization-user.updated.v1',
        {
          email: organizationUser.getEmail().value,
          displayName: organizationUser.getDisplayName().value,
          organizationUserId: organizationUser.getId().value,
        },
        'organization-user-iam',
        'OrganizationUser',
        organizationUser.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: false }, prisma);

      organizationUser.commit();
    });
  }
}
