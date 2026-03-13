import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestResetPasswordCommand } from '../commands/request-reset-password.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../shared/outbox/outbox.service';
import { IntegrationEvent } from '../../../../shared/outbox/outbox.types';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamRequestedResetPasswordV1Payload,
} from '../contracts/integration-events';

@CommandHandler(RequestResetPasswordCommand)
export class RequestResetPasswordCommandHandler implements ICommandHandler<
  RequestResetPasswordCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: RequestResetPasswordCommand): Promise<void> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { email } = command;

      const organizationUser =
        await this.organizationUserRepository.findByEmail(email, prisma);

      if (!organizationUser) return;

      const event = new IntegrationEvent<
        OrganizationUserIamRequestedResetPasswordV1Payload,
        OrganizationUserIamIntegrationEventTypes
      >(
        'organization-user-iam.organization-user.requested-reset-password.v1',
        {
          email: organizationUser.getEmail().value,
          organizationUserId: organizationUser.getId().value,
          displayName: organizationUser.getDisplayName().value,
        },
        'organization-user-iam',
        'OrganizationUser',
        organizationUser.getId().value,
      );
      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);
    });
  }
}
