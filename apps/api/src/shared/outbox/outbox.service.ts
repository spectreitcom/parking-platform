import { Injectable, Logger } from '@nestjs/common';
import { Prisma, OutboxStatus } from '@prisma/client';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmitOptions,
  EnqueueOptions,
  IntegrationEvent,
  IntegrationEventHeaders,
} from './outbox.types';
import { PrismaTx } from '../prisma/types';

const DEFAULT_BATCH = 50;

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async enqueue(
    event: IntegrationEvent,
    options: EnqueueOptions = {},
    tx: PrismaTx,
  ): Promise<{ id: string; alreadyQueued: boolean }> {
    if (options.deduplicate) {
      const exists = await this.isEnqueued(
        {
          type: event.type,
          boundedContext: event.boundedContext ?? undefined,
          aggregateType: event.aggregateType ?? undefined,
          aggregateId: event.aggregateId ?? undefined,
          payload: event.payload as Prisma.InputJsonValue,
        },
        tx,
      );

      if (exists) {
        return { id: exists.id, alreadyQueued: true };
      }
    }

    const created = await tx.outboxMessage.create({
      data: {
        type: event.type,
        boundedContext: event.boundedContext ?? null,
        aggregateType: event.aggregateType ?? null,
        aggregateId: event.aggregateId ?? null,
        payload: event.payload as Prisma.InputJsonValue,
        headers: (event.headers ?? null) as Prisma.InputJsonValue,
        status: OutboxStatus.PENDING,
        attemptCount: 0,
      },
      select: { id: true },
    });

    return { id: created.id, alreadyQueued: false };
  }

  async isEnqueued(
    criteria: {
      type: string;
      boundedContext?: string;
      aggregateType?: string;
      aggregateId?: string;
      payload?: Prisma.InputJsonValue;
    },
    tx?: PrismaTx,
  ): Promise<{ id: string } | null> {
    const prisma = tx ?? this.prisma;
    const { type, boundedContext, aggregateType, aggregateId, payload } =
      criteria;

    const msg = await prisma.outboxMessage.findFirst({
      where: {
        type,
        ...(boundedContext ? { boundedContext } : {}),
        ...(aggregateType ? { aggregateType } : {}),
        ...(aggregateId ? { aggregateId } : {}),
        ...(payload !== undefined
          ? {
              payload: {
                equals: payload,
              } as Prisma.JsonFilter<'OutboxMessage'>,
            }
          : {}),
        status: { in: [OutboxStatus.PENDING, OutboxStatus.PROCESSING] },
      },
      select: { id: true },
    });

    return msg ?? null;
  }

  async emitPending(options: EmitOptions = {}): Promise<void> {
    const batch = options.maxBatchSize ?? DEFAULT_BATCH;
    const now = new Date();

    const messages = await this.prisma.outboxMessage.findMany({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
      orderBy: { createdAt: 'asc' },
      take: batch,
    });

    if (messages.length > 0) {
      this.logger.debug(
        `Emitting ${messages.length} pending outbox messages...`,
      );
    }

    for (const msg of messages) {
      try {
        // oznacz jako PROCESSING (best-effort, bez blokad)
        await this.prisma.outboxMessage.update({
          where: { id: msg.id },
          data: { status: OutboxStatus.PROCESSING },
        });

        const event = new IntegrationEvent(
          msg.type,
          msg.payload as unknown,
          msg.boundedContext,
          msg.aggregateType,
          msg.aggregateId,
          (msg.headers ?? undefined) as IntegrationEventHeaders,
        );

        await this.eventBus.publish(event);

        await this.prisma.outboxMessage.update({
          where: { id: msg.id },
          data: {
            status: OutboxStatus.SENT,
            processedAt: new Date(),
            nextRetryAt: null,
          },
        });
      } catch (err) {
        this.logger.error(
          `Emit failed for outbox message ${msg.id}: ${(err as Error).message}`,
        );
        const next = this.calculateBackoff(msg.attemptCount ?? 0);
        await this.prisma.outboxMessage.update({
          where: { id: msg.id },
          data: {
            status: OutboxStatus.FAILED,
            attemptCount: (msg.attemptCount ?? 0) + 1,
            nextRetryAt: next,
          },
        });
      }
    }
  }

  async cleanOld(days = 7): Promise<number> {
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const res = await this.prisma.outboxMessage.deleteMany({
      where: {
        status: { in: [OutboxStatus.SENT, OutboxStatus.FAILED] },
        updatedAt: { lt: threshold },
      },
    });
    return res.count;
  }

  private calculateBackoff(attempt: number): Date {
    // prosty exponential backoff: 2^attempt minut (max 60 min)
    const minutes = Math.min(60, Math.pow(2, attempt));
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
