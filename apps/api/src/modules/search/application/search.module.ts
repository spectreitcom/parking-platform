import { Module } from '@nestjs/common';
import { SearchFacade } from './search.facade';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ieHandlers } from './event-handlers/ie';
import { OutboxModule } from 'src/shared/outbox/outbox.module';
import { queryHandlers } from './query-handlers';

@Module({
  imports: [PrismaModule, OutboxModule],
  providers: [SearchFacade, ...ieHandlers, ...queryHandlers],
  exports: [SearchFacade],
})
export class SearchModule {}
