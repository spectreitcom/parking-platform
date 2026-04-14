import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../ports/email.service';
import {
  AdminIamAdminUserInvitedV1Payload,
  AdminIamIntegrationEventTypes,
} from 'src/modules/admin-iam/application/contracts/integration-events';
import { AdminWelcomeEmail } from 'src/modules/email-notification/application/email/admin-welcome.email';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { OutboxService } from 'src/shared/outbox/outbox.service';

@EventsHandler(IntegrationEvent)
export class AdminIamInvitedIEHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(AdminIamInvitedIEHandler.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly adminIamFacade: AdminIamFacade,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(
    event: IntegrationEvent<
      AdminIamAdminUserInvitedV1Payload,
      AdminIamIntegrationEventTypes
    >,
  ) {
    if (event.type !== 'admin-iam.admin-user.invited.v1') return;
    this.logger.log('Handling admin-iam.admin-user.invited.v1 event');

    const outboxId = event.headers?.outboxId;

    try {
      const { email, adminUserId } = event.payload;

      const resetPasswordToken =
        await this.adminIamFacade.generateResetPasswordToken(adminUserId);

      await this.emailService.send(
        new AdminWelcomeEmail(email, resetPasswordToken),
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
