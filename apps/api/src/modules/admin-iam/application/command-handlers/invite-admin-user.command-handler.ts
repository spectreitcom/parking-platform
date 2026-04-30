import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { InviteAdminUserCommand } from '../commands/invite-admin-user.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { AppError } from 'src/shared/errors';
import { AdminUser } from '../../domain/admin-user';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  AdminIamAdminUserInvitedV1Payload,
  AdminIamIntegrationEventTypes,
} from '@repo/api-contracts';

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

      const adminUser = AdminUser.invite(email, displayName);
      this.eventPublisher.mergeObjectContext(adminUser);

      await this.adminUserRepository.save(adminUser, {
        isNew: true,
        tx: prisma,
      });

      const event = new IntegrationEvent<
        AdminIamAdminUserInvitedV1Payload,
        AdminIamIntegrationEventTypes
      >(
        'admin-iam.admin-user.invited.v1',
        {
          email: adminUser.getEmail().value,
          displayName: adminUser.getDisplayName().value,
          adminUserId: adminUser.getId().value,
        },
        'admin-iam',
        'AdminUser',
        adminUser.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);

      adminUser.commit();

      return adminUser.getId().value;
    });
  }
}
