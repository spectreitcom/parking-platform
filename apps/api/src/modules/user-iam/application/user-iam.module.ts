import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/modules/user-iam/infrastructure/infrastructure.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { eventHandlers } from 'src/modules/user-iam/application/event-handlers';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { commandHandlers } from 'src/modules/user-iam/application/command-handlers';
import { queryHandlers } from 'src/modules/user-iam/application/query-handlers';
import { OutboxModule } from 'src/shared/outbox/outbox.module';

@Module({
  imports: [InfrastructureModule, PrismaModule, OutboxModule],
  providers: [
    UserIamFacade,
    ...eventHandlers,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [UserIamFacade],
})
export class UserIamModule {}
