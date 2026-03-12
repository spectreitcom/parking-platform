import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';
import { eventHandlers } from './event-handlers';
import { OrganizationUserIamFacade } from './organization-user-iam.facade';
import { OutboxModule } from '../../../shared/outbox/outbox.module';

@Module({
  imports: [InfrastructureModule, PrismaModule, OutboxModule],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    OrganizationUserIamFacade,
  ],
  exports: [OrganizationUserIamFacade],
})
export class OrganizationUserIamModule {}
