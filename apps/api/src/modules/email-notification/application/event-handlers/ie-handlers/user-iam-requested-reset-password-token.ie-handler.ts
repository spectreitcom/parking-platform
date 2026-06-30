import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { ResetPasswordEmail } from 'src/modules/email-notification/application/email/reset-password.email';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import {
  UserIamIntegrationEventTypes,
  UserIamRequestedResetPasswordV1Payload,
} from '@repo/api-contracts';
import { ConfigService } from '@nestjs/config';

type Event = IntegrationEvent<
  UserIamRequestedResetPasswordV1Payload,
  UserIamIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class UserIamRequestedResetPasswordTokenIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(
    UserIamRequestedResetPasswordTokenIeHandler.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly userIamFacade: UserIamFacade,
    private readonly configService: ConfigService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'user-iam.user.requested-reset-password.v1') return;
    this.logger.log('Handling user-iam.user.requested-reset-password.v1 event');

    const { email, userId } = event.payload;

    const appUrl = this.configService.getOrThrow<string>('USER_APP_URL');

    const resetPasswordToken =
      await this.userIamFacade.generateResetPasswordToken(userId);

    await this.emailService.send(
      new ResetPasswordEmail(email, resetPasswordToken, appUrl),
    );
  }
}
