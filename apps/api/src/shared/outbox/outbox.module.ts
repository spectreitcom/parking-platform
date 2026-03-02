import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxService } from './outbox.service';
import { OutboxScheduler } from './outbox.scheduler';

@Module({
  imports: [PrismaModule, CqrsModule],
  providers: [OutboxService, OutboxScheduler],
  exports: [OutboxService],
})
export class OutboxModule {}
