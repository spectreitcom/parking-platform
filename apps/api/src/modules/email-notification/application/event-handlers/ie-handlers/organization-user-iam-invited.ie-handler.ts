import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../ports/email.service';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';
import { OrganizationUserWelcomeEmail } from '../../email/organization-user-welcome.email';
import { ConfigService } from '@nestjs/config';

type Event = IntegrationEvent<
  OrganizationUserIamRequestedResetPasswordV1Payload,
  OrganizationUserIamIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class OrganizationUserIamInvitedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(
    OrganizationUserIamInvitedIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
    private readonly configService: ConfigService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'organization-user-iam.organization-user.invited.v1')
      return;

    this.logger.log(
      'Handling organization-user-iam.organization-user.invited.v1 event',
    );

    const { email, organizationUserId, displayName } = event.payload;

    const appUrl = this.configService.getOrThrow<string>('MANAGER_APP_URL');

    const resetPasswordToken =
      await this.organizationUserIamFacade.generateResetPasswordToken(
        organizationUserId,
      );

    await this.emailService.send(
      new OrganizationUserWelcomeEmail(
        email,
        resetPasswordToken,
        displayName,
        appUrl,
      ),
    );
  }
}
