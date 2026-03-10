import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestResetPasswordCommand } from '../commands/request-reset-password.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { randomUUID } from 'node:crypto';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../shared/outbox/outbox.service';
import { IntegrationEvent } from '../../../../shared/outbox/outbox.types';
import {
  AdminIamIntegrationEventTypes,
  AdminIamRequestedResetPasswordV1Payload,
} from '../contracts/integration-events';

@CommandHandler(RequestResetPasswordCommand)
export class RequestResetPasswordCommandHandler implements ICommandHandler<
  RequestResetPasswordCommand,
  void
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly resetPasswordService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
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

      const resetPasswordToken = randomUUID();

      const resetPasswordTokenHash =
        this.resetPasswordService.createHash(resetPasswordToken);

      const event = new IntegrationEvent<
        AdminIamRequestedResetPasswordV1Payload,
        AdminIamIntegrationEventTypes
      >(
        'admin-iam.admin-user.requested-reset-password.v1',
        {
          email: adminUser.getEmail().value,
          resetPasswordToken,
          displayName: adminUser.getDisplayName().value,
        },
        'admin-iam',
        'AdminUser',
        adminUser.getId().value,
      );
      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);

      await this.resetPasswordTokenStorage.insert(
        adminUser.getId().value,
        resetPasswordTokenHash,
      );
    });
  }
}
