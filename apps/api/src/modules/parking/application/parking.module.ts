import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { ParkingFacade } from './parking.facade';
import { eventHandlers } from './event-handlers';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { queryHandlers } from './query-handlers';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...queryHandlers,
    ParkingFacade,
  ],
  exports: [ParkingFacade],
})
export class ParkingModule {}
