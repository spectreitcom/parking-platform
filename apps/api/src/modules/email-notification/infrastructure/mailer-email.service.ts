import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { Email } from '../application/email';

@Injectable()
export class MailerEmailService implements EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(email: Email): Promise<void> {
    await this.mailerService.sendMail({
      to: email.to,
      subject: email.subject,
      template: email.template,
      context: {
        ...email.context,
      },
    });
  }
}
