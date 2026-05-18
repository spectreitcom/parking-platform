import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { ParkingFacade } from './parking.facade';
import { eventHandlers } from './event-handlers';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { queryHandlers } from './query-handlers';
import { ieHandlers } from './event-handlers/ie-handlers';
import { OutboxModule } from 'src/shared/outbox/outbox.module';

@Module({
  imports: [InfrastructureModule, PrismaModule, OutboxModule],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...ieHandlers,
    ...queryHandlers,
    ParkingFacade,
  ],
  exports: [ParkingFacade],
})
export class ParkingModule {}
