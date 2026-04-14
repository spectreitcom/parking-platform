import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  AdminIamIntegrationEventTypes,
  AdminIamRequestedResetPasswordV1Payload,
} from 'src/modules/admin-iam/application/contracts/integration-events';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { ResetPasswordEmail } from 'src/modules/email-notification/application/email/reset-password.email';
import { OutboxService } from 'src/shared/outbox/outbox.service';

@EventsHandler(IntegrationEvent)
export class AdminIamRequestedResetPasswordTokenIeHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(
    AdminIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly adminIamFacade: AdminIamFacade,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(
    event: IntegrationEvent<
      AdminIamRequestedResetPasswordV1Payload,
      AdminIamIntegrationEventTypes
    >,
  ) {
    if (event.type !== 'admin-iam.admin-user.requested-reset-password.v1')
      return;
    this.logger.log(
      'Handling admin-iam.admin-user.requested-reset-password.v1 event',
    );

    const outboxId = event.headers?.outboxId;

    try {
      const { email, adminUserId } = event.payload;

      const resetPasswordToken =
        await this.adminIamFacade.generateResetPasswordToken(adminUserId);

      await this.emailService.send(
        new ResetPasswordEmail(email, resetPasswordToken),
      );

      if (outboxId) {
        await this.outboxService.ack(outboxId);
      }
    } catch (error) {
      if (outboxId) {
        await this.outboxService.nack(outboxId, {
          requeue: true,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }
}
