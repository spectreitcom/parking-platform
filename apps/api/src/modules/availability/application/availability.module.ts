import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AvailabilityFacade } from './availability.facade';
import { eventHandlers } from './event-handlers';
import { ieHandlers } from './event-handlers/ie-handlers';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';

@Module({
  imports: [PrismaModule, CqrsModule],
  providers: [
    AvailabilityFacade,
    ...eventHandlers,
    ...ieHandlers,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [AvailabilityFacade],
})
export class AvailabilityModule {}
