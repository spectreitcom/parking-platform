import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { commandHandlers } from './command-handlers';
import { eventHandlers } from './event-handlers';
import { AdminIamFacade } from './admin-iam.facade';

@Module({
  imports: [InfrastructureModule],
  providers: [...commandHandlers, ...eventHandlers, AdminIamFacade],
  exports: [AdminIamFacade],
})
export class AdminIamModule {}
