import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';
import { eventHandlers } from './event-handlers';
import { OrganizationFacade } from './organization.facade';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ieHandlers } from './event-handlers/ie-handlers';
import { OutboxModule } from 'src/shared/outbox/outbox.module';

@Module({
  imports: [InfrastructureModule, PrismaModule, OutboxModule],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...ieHandlers,
    OrganizationFacade,
  ],
  exports: [OrganizationFacade],
})
export class OrganizationModule {}
