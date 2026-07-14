import { Module } from '@nestjs/common';
import { PaymentFacade } from './payment.facade';
import { commandHandlers } from './command-handlers';
import { queryHandlers } from './query-handlers';
import { ieHandlers } from './event-handlers/ie';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, PrismaModule],
  providers: [
    PaymentFacade,
    ...commandHandlers,
    ...queryHandlers,
    ...ieHandlers,
  ],
  exports: [PaymentFacade],
})
export class PaymentModule {}
