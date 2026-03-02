import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';

@Injectable()
export class OutboxScheduler {
  private readonly logger = new Logger(OutboxScheduler.name);

  constructor(private readonly outboxService: OutboxService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleEmit() {
    try {
      await this.outboxService.emitPending();
    } catch (err) {
      this.logger.error(
        `Error in outbox emit cron: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting outbox cleanup...');
    const count = await this.outboxService.cleanOld(7);
    this.logger.log(`Outbox cleanup finished. Removed ${count} messages.`);
  }
}
