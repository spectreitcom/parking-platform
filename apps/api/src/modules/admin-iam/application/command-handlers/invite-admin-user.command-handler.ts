import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { InviteAdminUserCommand } from '../commands/invite-admin-user.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { OutboxService } from '../../../../shared/outbox/outbox.service';
import { AppError } from '../../../../shared/errors';
import { AdminUser } from '../../domain/admin-user';
import { TransactionRunner } from '../../../../shared/prisma/transaction-runner';
import { IntegrationEvent } from '../../../../shared/outbox/outbox.types';
import {
  AdminIamAdminUserInvitedV1Payload,
  AdminIamIntegrationEventTypes,
} from '../contracts/integration-events';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { randomUUID } from 'node:crypto';

@CommandHandler(InviteAdminUserCommand)
export class InviteAdminUserCommandHandler implements ICommandHandler<
  InviteAdminUserCommand,
  string
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
    private readonly resetPasswordService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
  ) {}

  async execute(command: InviteAdminUserCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { displayName, email } = command;

      const existingAdminUser = await this.adminUserRepository.findByEmail(
        email,
        prisma,
      );

      if (existingAdminUser) {
        throw new AppError('ALREADY_EXISTS', 'Admin user already exists');
      }

      const adminUser = AdminUser.create(email, displayName);
      this.eventPublisher.mergeObjectContext(adminUser);

      adminUser.invite();
      await this.adminUserRepository.save(adminUser, {
        isNew: true,
        tx: prisma,
      });

      adminUser.commit();

      const resetPasswordToken = randomUUID();

      const resetPasswordTokenHash =
        this.resetPasswordService.createHash(resetPasswordToken);

      const event = new IntegrationEvent<
        AdminIamAdminUserInvitedV1Payload,
        AdminIamIntegrationEventTypes
      >(
        'admin-iam.admin-user.invited.v1',
        {
          email: adminUser.getEmail().value,
          displayName: adminUser.getDisplayName().value,
          resetPasswordToken,
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

      return adminUser.getId().value;
    });
  }
}
