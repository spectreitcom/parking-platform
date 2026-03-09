import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { ParkingFacade } from './parking.facade';
import { eventHandlers } from './event-handlers';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [...commandHandlers, ...eventHandlers, ParkingFacade],
  exports: [ParkingFacade],
})
export class ParkingModule {}
