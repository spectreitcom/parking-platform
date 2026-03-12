import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationUserCommand } from '../commands/create-organization-user.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { OutboxService } from '../../../../shared/outbox/outbox.service';
import { AppError } from '../../../../shared/errors';
import { OrganizationUser } from '../../domain/organization-user';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { IntegrationEvent } from '../../../../shared/outbox/outbox.types';
import {
  OrganizationUserIamCreatedV1Payload,
  OrganizationUserIamIntegrationEventTypes,
} from '../contracts/integration-events';

@CommandHandler(CreateOrganizationUserCommand)
export class CreateOrganizationUserCommandHandler implements ICommandHandler<
  CreateOrganizationUserCommand,
  string
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: CreateOrganizationUserCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { displayName, email, passwordHash } = command;

      const existingUser = await this.organizationUserRepository.findByEmail(
        email,
        prisma,
      );

      if (existingUser) {
        throw new AppError(
          'ALREADY_EXISTS',
          'Organization user already exists',
        );
      }

      const organizationUser = OrganizationUser.create(
        email,
        displayName,
        passwordHash,
      );
      this.eventPublisher.mergeObjectContext(organizationUser);

      await this.organizationUserRepository.save(organizationUser, {
        isNew: true,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        OrganizationUserIamCreatedV1Payload,
        OrganizationUserIamIntegrationEventTypes
      >(
        'organization-user-iam.organization-user.created.v1',
        {
          email: organizationUser.getEmail().value,
          displayName: organizationUser.getDisplayName().value,
          organizationUserId: organizationUser.getId().value,
        },
        'organization-user-iam',
        'OrganizationUser',
        organizationUser.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);

      organizationUser.commit();

      return organizationUser.getId().value;
    });
  }
}
