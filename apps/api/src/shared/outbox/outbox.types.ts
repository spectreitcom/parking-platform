import { IEvent } from '@nestjs/cqrs';

export type IntegrationEventHeaders = {
  outboxId?: string;
  traceId?: string;
  correlationId?: string;
  userId?: string;
  idempotencyKey?: string;
  [key: string]: unknown;
};

export class IntegrationEvent<
  TPayload = unknown,
  TEventType extends string = string,
> implements IEvent {
  constructor(
    public readonly type: TEventType,
    public readonly payload: TPayload,
    public readonly boundedContext?: string | null,
    public readonly aggregateType?: string | null,
    public readonly aggregateId?: string | null,
    public readonly headers?: IntegrationEventHeaders | null,
  ) {}
}

export type EnqueueOptions = {
  // Jeśli ustawione, próbuje najpierw sprawdzić czy identyczne zdarzenie już oczekuje
  deduplicate?: boolean;
};

export type EmitOptions = {
  // Maksymalna liczba wiadomości do obsłużenia w jednym przebiegu
  maxBatchSize?: number;
};
