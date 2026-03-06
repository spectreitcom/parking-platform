import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '../env-schema';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './shared/outbox/outbox.module';
import { AdminApiModule } from './modules/admin-api/admin-api.module';

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
})
export class AppModule {}
