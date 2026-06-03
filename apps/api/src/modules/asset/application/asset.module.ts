import { Module } from '@nestjs/common';
import { AssetFacade } from './asset.facade';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';
import { eventHandlers } from './event-handlers';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [
    AssetFacade,
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
  ],
  exports: [AssetFacade],
})
export class AssetModule {}
