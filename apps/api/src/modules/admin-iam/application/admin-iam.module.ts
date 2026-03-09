import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { eventHandlers } from './event-handlers';
import { AdminIamFacade } from './admin-iam.facade';
import { queryHandlers } from './query-handlers';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...queryHandlers,
    AdminIamFacade,
  ],
  exports: [AdminIamFacade],
})
export class AdminIamModule {}
