import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestResetPasswordCommand } from '../commands/request-reset-password.command';
import { UserRepository } from '../ports/user.repository';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';
import {
  UserIamIntegrationEventTypes,
  UserIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';

@CommandHandler(RequestResetPasswordCommand)
export class RequestResetPasswordCommandHandler implements ICommandHandler<
  RequestResetPasswordCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: RequestResetPasswordCommand): Promise<void> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { email } = command;
      const user = await this.userRepository.findByEmail(email, prisma);

      if (!user) return;

      if (!user.getProvider().equals(LoginProvider.credentials())) return;

      const event = new IntegrationEvent<
        UserIamRequestedResetPasswordV1Payload,
        UserIamIntegrationEventTypes
      >(
        'user-iam.user.requested-reset-password.v1',
        {
          email: user.getEmail().value,
          name: user.getName().value,
          userId: user.getId().value,
        },
        'user-iam',
        'User',
        user.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: true }, prisma);
    });
  }
}
