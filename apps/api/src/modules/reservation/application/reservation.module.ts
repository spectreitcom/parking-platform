import { Module } from '@nestjs/common';
import { ReservationFacade } from './reservation.facade';
import { commandHandlers } from './command-handlers';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { eventHandlers } from './event-handlers';
import { queryHandlers } from './query-handlers';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [
    ReservationFacade,
    ...commandHandlers,
    ...eventHandlers,
    ...queryHandlers,
  ],
  exports: [ReservationFacade],
})
export class ReservationModule {}
