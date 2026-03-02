import { IEvent } from '@nestjs/cqrs';

export type IntegrationEventType = '';

export type IntegrationEventHeaders = {
  traceId?: string;
  correlationId?: string;
  userId?: string;
  idempotencyKey?: string;
  // miejsce na dodatkowe meta
  [key: string]: unknown;
};

export class IntegrationEvent<TPayload = unknown> implements IEvent {
  constructor(
    public readonly type: string,
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
