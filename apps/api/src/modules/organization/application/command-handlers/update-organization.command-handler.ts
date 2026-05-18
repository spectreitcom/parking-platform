import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from '../commands/update-organization.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  OrganizationIntegrationEventTypes,
  OrganizationUpdatedV1Payload,
} from '@repo/api-contracts';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationCommandHandler implements ICommandHandler<
  UpdateOrganizationCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: UpdateOrganizationCommand): Promise<string> {
    return this.transactionRunner.runInTransaction(async (prisma) => {
      const { id, name, address, taxId, version } = command;

      const organization = await this.organizationRepository.findById(id);

      if (!organization) {
        throw new AppError('ENTITY_NOT_FOUND', 'Organization not found');
      }

      const _version = AggregateVersion.fromNumber(version);

      if (!organization.getVersion().equals(_version)) {
        throw new AppError(
          'CONCURRENCY',
          `Organization with id ${id} has been modified by another process`,
        );
      }

      this.eventPublisher.mergeObjectContext(organization);
      organization.update(name, address, taxId);

      await this.organizationRepository.save(organization, {
        tx: prisma,
      });

      const event = new IntegrationEvent<
        OrganizationUpdatedV1Payload,
        OrganizationIntegrationEventTypes
      >(
        'organization.organization.updated.v1',
        {
          organizationId: organization.getId().value,
          name,
          address,
          taxId,
        },
        'organization',
        'Organization',
        organization.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);

      organization.commit();

      return organization.getId().value;
    });
  }
}
