import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { ResetPasswordEmail } from 'src/modules/email-notification/application/email/reset-password.email';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import {
  UserIamIntegrationEventTypes,
  UserIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';

@EventsHandler(IntegrationEvent)
export class UserIamRequestedResetPasswordTokenIeHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(
    UserIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly userIamFacade: UserIamFacade,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(
    event: IntegrationEvent<
      UserIamRequestedResetPasswordV1Payload,
      UserIamIntegrationEventTypes
    >,
  ) {
    if (event.type !== 'user-iam.user.requested-reset-password.v1') return;
    this.logger.log('Handling user-iam.user.requested-reset-password.v1 event');

    const outboxId = event.headers?.outboxId;
    let emailSent = false;

    try {
      const { email, userId } = event.payload;

      const resetPasswordToken =
        await this.userIamFacade.generateResetPasswordToken(userId);

      await this.emailService.send(
        new ResetPasswordEmail(email, resetPasswordToken),
      );
      emailSent = true;

      if (outboxId) {
        await this.outboxService.ack(outboxId);
      }
    } catch (error) {
      if (outboxId && !emailSent) {
        await this.outboxService.nack(outboxId, {
          requeue: true,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }
}
