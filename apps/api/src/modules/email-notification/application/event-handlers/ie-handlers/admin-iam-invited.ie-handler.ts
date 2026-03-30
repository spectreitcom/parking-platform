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

@EventsHandler(IntegrationEvent)
export class AdminIamInvitedIEHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(AdminIamInvitedIEHandler.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly adminIamFacade: AdminIamFacade,
  ) {}

  async handle(
    event: IntegrationEvent<
      AdminIamAdminUserInvitedV1Payload,
      AdminIamIntegrationEventTypes
    >,
  ) {
    if (event.type !== 'admin-iam.admin-user.invited.v1') return;
    this.logger.log('Handling admin-iam.admin-user.invited.v1 event', event);

    const { email, adminUserId } = event.payload;

    const resetPasswordToken =
      await this.adminIamFacade.generateResetPasswordToken(adminUserId);

    await this.emailService.send(
      new AdminWelcomeEmail(email, resetPasswordToken),
    );
  }
}
