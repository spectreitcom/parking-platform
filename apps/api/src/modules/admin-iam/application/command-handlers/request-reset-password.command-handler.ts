import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestResetPasswordCommand } from '../commands/request-reset-password.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  AdminIamIntegrationEventTypes,
  AdminIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';

@CommandHandler(RequestResetPasswordCommand)
export class RequestResetPasswordCommandHandler implements ICommandHandler<
  RequestResetPasswordCommand,
  void
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: RequestResetPasswordCommand): Promise<void> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { email } = command;

      const adminUser = await this.adminUserRepository.findByEmail(
        email,
        prisma,
      );

      if (!adminUser) return;

      const event = new IntegrationEvent<
        AdminIamRequestedResetPasswordV1Payload,
        AdminIamIntegrationEventTypes
      >(
        'admin-iam.admin-user.requested-reset-password.v1',
        {
          email: adminUser.getEmail().value,
          displayName: adminUser.getDisplayName().value,
          adminUserId: adminUser.getId().value,
        },
        'admin-iam',
        'AdminUser',
        adminUser.getId().value,
      );
      await this.outboxService.enqueue(event, { deduplicate: false }, prisma);
    });
  }
}
