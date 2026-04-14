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

@EventsHandler(IntegrationEvent)
export class OrganizationUserIamRequestedResetPasswordTokenIeHandler implements IEventHandler<IntegrationEvent> {
  private readonly logger = new Logger(
    OrganizationUserIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
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

    const { email, organizationUserId } = event.payload;

    const resetPasswordToken =
      await this.organizationUserIamFacade.generateResetPasswordToken(
        organizationUserId,
      );

    await this.emailService.send(
      new ResetPasswordEmail(email, resetPasswordToken),
    );
  }
}
