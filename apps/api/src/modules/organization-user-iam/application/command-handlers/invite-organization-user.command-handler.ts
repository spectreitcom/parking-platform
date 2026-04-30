import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { InviteOrganizationUserCommand } from '../commands/invite-organization-user.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { OrganizationUser } from '../../domain/organization-user';
import { AppError } from 'src/shared/errors';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamOrganizationUserInvitedV1Payload,
} from '@repo/api-contracts';

@CommandHandler(InviteOrganizationUserCommand)
export class InviteOrganizationUserCommandHandler implements ICommandHandler<
  InviteOrganizationUserCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: InviteOrganizationUserCommand): Promise<void> {
    await this.transactionRunner.runInTransaction(async (prisma) => {
      const { email, displayName } = command;

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

      const organizationUser = OrganizationUser.invite(email, displayName);

      this.eventPublisher.mergeObjectContext(organizationUser);

      await this.organizationUserRepository.save(organizationUser, {
        isNew: true,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        OrganizationUserIamOrganizationUserInvitedV1Payload,
        OrganizationUserIamIntegrationEventTypes
      >(
        'organization-user-iam.organization-user.invited.v1',
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
    });
  }
}
