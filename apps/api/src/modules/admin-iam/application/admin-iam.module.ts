import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { cliCommands } from './cli';
import { eventHandlers } from './event-handlers';
import { AdminIamFacade } from './admin-iam.facade';
import { queryHandlers } from './query-handlers';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { OutboxModule } from '../../../shared/outbox/outbox.module';

@Module({
  imports: [InfrastructureModule, PrismaModule, OutboxModule],
  providers: [
    ...commandHandlers,
    ...cliCommands,
    ...eventHandlers,
    ...queryHandlers,
    AdminIamFacade,
  ],
  exports: [AdminIamFacade],
})
export class AdminIamModule {}
