import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { ParkingFacade } from './parking.facade';
import { eventHandlers } from './event-handlers';

@Module({
  imports: [InfrastructureModule],
  providers: [...commandHandlers, ...eventHandlers, ParkingFacade],
  exports: [ParkingFacade],
})
export class ParkingModule {}
