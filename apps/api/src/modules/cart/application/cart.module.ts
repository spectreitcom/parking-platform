import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CartFacade } from './cart.facade';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';

@Module({
  imports: [InfrastructureModule],
  providers: [CartFacade, ...commandHandlers, ...queryHandlers],
  exports: [CartFacade],
})
export class CartModule {}
