import { Injectable, Logger } from '@nestjs/common';
import { Prisma, OutboxStatus } from '@prisma/client';
import { EventBus } from '@nestjs/cqrs';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmitOptions,
  EnqueueOptions,
  IntegrationEvent,
  IntegrationEventHeaders,
} from './outbox.types';
import { PrismaTx } from '../prisma/types';

const DEFAULT_BATCH = 50;
const MAX_BATCH_SIZE = 500;
const MAX_RETRIES = 5;
const LEASE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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
    const deduplicationKey = options.deduplicate
      ? this.generateDeduplicationKey(event)
      : null;

    if (deduplicationKey) {
      const exists = await this.isEnqueuedByKey(deduplicationKey, tx);
      if (exists) {
        return { id: exists.id, alreadyQueued: true };
      }
    }

    try {
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
          deduplicationKey,
        },
        select: { id: true },
      });

      return { id: created.id, alreadyQueued: false };
    } catch (error) {
      if (
        deduplicationKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const exists = await this.isEnqueuedByKey(deduplicationKey, tx);
        if (exists) {
          return { id: exists.id, alreadyQueued: true };
        }
      }
      throw error;
    }
  }

  private generateDeduplicationKey(event: IntegrationEvent): string {
    const payloadString = JSON.stringify(event.payload);
    const fingerprint = createHash('sha256')
      .update(payloadString)
      .digest('hex');

    return [
      event.type,
      event.boundedContext ?? '',
      event.aggregateType ?? '',
      event.aggregateId ?? '',
      fingerprint,
    ].join(':');
  }

  async isEnqueuedByKey(
    deduplicationKey: string,
    tx?: PrismaTx,
  ): Promise<{ id: string } | null> {
    const prisma = tx ?? this.prisma;
    return prisma.outboxMessage.findUnique({
      where: { deduplicationKey },
      select: { id: true },
    });
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
    const event = new IntegrationEvent(
      criteria.type,
      criteria.payload,
      criteria.boundedContext,
      criteria.aggregateType,
      criteria.aggregateId,
    );
    const key = this.generateDeduplicationKey(event);
    return this.isEnqueuedByKey(key, tx);
  }

  async emitPending(options: EmitOptions = {}): Promise<void> {
    let batchCandidate = options.maxBatchSize ?? DEFAULT_BATCH;
    if (!Number.isInteger(batchCandidate) || batchCandidate < 1) {
      batchCandidate = 1;
    }
    if (batchCandidate > MAX_BATCH_SIZE) {
      batchCandidate = MAX_BATCH_SIZE;
    }
    const batch = batchCandidate;
    const now = new Date();
    const staleCutoff = new Date(now.getTime() - LEASE_DURATION_MS);

    const messages = await this.prisma.$queryRaw<
      Prisma.OutboxMessageGetPayload<Record<string, never>>[]
    >(
      Prisma.sql`
        UPDATE "OutboxMessage"
        SET status = ${OutboxStatus.PROCESSING}::"OutboxStatus",
            "updatedAt" = ${now}
        WHERE id IN (
          SELECT id
          FROM "OutboxMessage"
          WHERE (
            status IN (${OutboxStatus.PENDING}::"OutboxStatus", ${OutboxStatus.FAILED}::"OutboxStatus")
            OR (status = ${OutboxStatus.PROCESSING}::"OutboxStatus" AND "updatedAt" <= ${staleCutoff})
          )
            AND ("nextRetryAt" IS NULL OR "nextRetryAt" <= ${now})
          ORDER BY "createdAt" ASC
          LIMIT ${batch}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `,
    );

    if (messages.length > 0) {
      this.logger.debug(
        `Emitting ${messages.length} pending outbox messages...`,
      );
    }

    for (const msg of messages) {
      try {
        const event = new IntegrationEvent(
          msg.type,
          msg.payload as unknown,
          msg.boundedContext,
          msg.aggregateType,
          msg.aggregateId,
          {
            ...(msg.headers as Record<string, unknown>),
            outboxId: msg.id,
          } as IntegrationEventHeaders,
        );

        await this.eventBus.publish(event);

        if (!options.manualAck) {
          await this.ack(msg.id);
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Emit failed for outbox message ${msg.id} (type: ${msg.type}): ${err.message}`,
        );

        const newAttempt = (msg.attemptCount ?? 0) + 1;

        if (newAttempt >= MAX_RETRIES) {
          this.logger.warn(
            `Message ${msg.id} reached max retries (${MAX_RETRIES}). Moving to DEAD_LETTER.`,
          );
          await this.prisma.outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: OutboxStatus.DEAD_LETTER,
              attemptCount: newAttempt,
              nextRetryAt: null,
            },
          });
        } else {
          const next = this.calculateBackoff(msg.attemptCount ?? 0);
          await this.prisma.outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: OutboxStatus.FAILED,
              attemptCount: newAttempt,
              nextRetryAt: next,
            },
          });
        }
      }
    }
  }

  async cleanOld(days = 7): Promise<number> {
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const res = await this.prisma.outboxMessage.deleteMany({
      where: {
        status: OutboxStatus.SENT,
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

  async ack(id: string, tx?: PrismaTx): Promise<void> {
    const prisma = tx ?? this.prisma;
    const res = await prisma.outboxMessage.updateMany({
      where: { id, status: OutboxStatus.PROCESSING },
      data: {
        status: OutboxStatus.SENT,
        processedAt: new Date(),
        nextRetryAt: null,
      },
    });

    if (res.count === 0) {
      this.logger.warn(
        `Ack for message ${id} failed: zero rows updated (likely not in PROCESSING state).`,
      );
    }
  }

  async nack(
    id: string,
    options: { requeue: boolean; reason?: string },
    tx?: PrismaTx,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    const res = await prisma.outboxMessage.updateMany({
      where: { id, status: OutboxStatus.PROCESSING },
      data: {
        attemptCount: { increment: 1 },
      },
    });

    if (res.count === 0) {
      this.logger.warn(
        `Nack for message ${id} failed: zero rows updated (likely not in PROCESSING state).`,
      );
      return;
    }

    const msg = await prisma.outboxMessage.findUnique({ where: { id } });
    if (!msg) return;

    const newAttempt = msg.attemptCount;

    if (options.requeue && newAttempt < MAX_RETRIES) {
      const next = this.calculateBackoff(newAttempt - 1);
      await prisma.outboxMessage.updateMany({
        where: { id, status: OutboxStatus.PROCESSING },
        data: {
          status: OutboxStatus.FAILED,
          nextRetryAt: next,
        },
      });
    } else {
      this.logger.warn(
        `Message ${msg.id} nacked without requeue or reached max retries (${MAX_RETRIES}). Moving to DEAD_LETTER.`,
      );
      await prisma.outboxMessage.updateMany({
        where: { id, status: OutboxStatus.PROCESSING },
        data: {
          status: OutboxStatus.DEAD_LETTER,
          nextRetryAt: null,
        },
      });
    }
  }
}
