import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './shared/outbox/outbox.module';
import { AdminApiModule } from './modules/admin-api/admin-api.module';
import { envSchema } from '../env-schema';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    OutboxModule,
    AdminApiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
