import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import path from 'path';
import { EmailService } from 'src/modules/email-notification/application/ports/email.service';
import { MailerEmailService } from 'src/modules/email-notification/infrastructure/mailer-email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILER_HOST')!,
          port: configService.get<number>('MAILER_PORT')!,
        },
        defaults: {
          from: 'noreply@parking.com',
        },
        template: {
          adapter: new HandlebarsAdapter(),
          dir: path.join(
            process.cwd(),
            'dist',
            'modules',
            'email-notification',
            'application',
            'email-templates',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: EmailService,
      useClass: MailerEmailService,
    },
  ],
  exports: [EmailService],
})
export class InfrastructureModule {}
