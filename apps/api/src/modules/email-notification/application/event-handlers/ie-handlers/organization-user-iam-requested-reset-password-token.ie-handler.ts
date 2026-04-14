import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { ResetPasswordEmail } from 'src/modules/email-notification/application/email/reset-password.email';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamRequestedResetPasswordV1Payload,
} from 'src/modules/organization-user-iam/application/contracts/integration-events';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { OutboxService } from 'src/shared/outbox/outbox.service';

@EventsHandler(IntegrationEvent)
export class OrganizationUserIamRequestedResetPasswordTokenIeHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(
    OrganizationUserIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(
    event: IntegrationEvent<
      OrganizationUserIamRequestedResetPasswordV1Payload,
      OrganizationUserIamIntegrationEventTypes
    >,
  ) {
    if (
      event.type !==
      'organization-user-iam.organization-user.requested-reset-password.v1'
    )
      return;
    this.logger.log(
      'Handling organization-user-iam.organization-user.requested-reset-password.v1 event',
    );

    const outboxId = event.headers?.outboxId;
    let emailSent = false;

    try {
      const { email, organizationUserId } = event.payload;

      const resetPasswordToken =
        await this.organizationUserIamFacade.generateResetPasswordToken(
          organizationUserId,
        );

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
