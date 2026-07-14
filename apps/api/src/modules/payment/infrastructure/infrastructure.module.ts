import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CancelReservationCron } from './cancel-reservation.cron';
import { OutboxModule } from 'src/shared/outbox/outbox.module';

@Module({
  imports: [PrismaModule, OutboxModule],
  providers: [CancelReservationCron],
  exports: [],
})
export class InfrastructureModule {}
