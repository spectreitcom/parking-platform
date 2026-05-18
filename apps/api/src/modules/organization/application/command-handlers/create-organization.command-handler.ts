import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from '../commands/create-organization.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { Organization } from '../../domain/organization';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  OrganizationCreatedV1Payload,
  OrganizationIntegrationEventTypes,
} from '@repo/api-contracts';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationCommandHandler implements ICommandHandler<
  CreateOrganizationCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<string> {
    return this.transactionRunner.runInTransaction(async (prisma) => {
      const { name, taxId, address } = command;

      const organization = Organization.create(name, address, taxId);

      this.eventPublisher.mergeObjectContext(organization);

      await this.organizationRepository.save(organization, {
        isNew: true,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        OrganizationCreatedV1Payload,
        OrganizationIntegrationEventTypes
      >(
        'organization.organization.created.v1',
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
