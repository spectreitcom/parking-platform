import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './shared/outbox/outbox.module';
import { AdminApiModule } from 'src/bff/admin-api/admin-api.module';
import { envSchema } from '../env-schema';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';
import { SentryModule } from '@sentry/nestjs/setup';
import { EmailNotificationModule } from 'src/modules/email-notification/application/email-notification.module';
import { ApiModule } from 'src/bff/api/api.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    OutboxModule,
    AdminApiModule,
    ApiModule,
    EmailNotificationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
