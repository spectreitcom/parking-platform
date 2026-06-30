import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { ResetPasswordEmail } from 'src/modules/email-notification/application/email/reset-password.email';
import {
  AdminIamIntegrationEventTypes,
  AdminIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';
import { ConfigService } from '@nestjs/config';

export type Event = IntegrationEvent<
  AdminIamRequestedResetPasswordV1Payload,
  AdminIamIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class AdminIamRequestedResetPasswordTokenIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(
    AdminIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly adminIamFacade: AdminIamFacade,
    private readonly configService: ConfigService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'admin-iam.admin-user.requested-reset-password.v1')
      return;
    this.logger.log(
      'Handling admin-iam.admin-user.requested-reset-password.v1 event',
    );

    const { email, adminUserId } = event.payload;

    const appUrl = this.configService.getOrThrow<string>('MANAGER_APP_URL');

    const resetPasswordToken =
      await this.adminIamFacade.generateResetPasswordToken(adminUserId);

    await this.emailService.send(
      new ResetPasswordEmail(email, resetPasswordToken, appUrl),
    );
  }
}
