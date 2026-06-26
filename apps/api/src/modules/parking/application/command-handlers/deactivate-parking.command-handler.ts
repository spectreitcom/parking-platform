import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateParkingCommand } from '../commands/deactivate-parking.command';
import { ParkingRepository } from '../ports/parking.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingDeactivatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';

@CommandHandler(DeactivateParkingCommand)
export class DeactivateParkingCommandHandler implements ICommandHandler<
  DeactivateParkingCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: DeactivateParkingCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { id, version } = command;

      const parking = await this.parkingRepository.findById(id, prisma);

      if (!parking) {
        throw new AppError(
          'ENTITY_NOT_FOUND',
          `Parking with id ${id} not found`,
        );
      }

      const _version = AggregateVersion.fromNumber(version);

      if (!parking.getVersion().equals(_version)) {
        throw new AppError(
          'CONCURRENCY',
          `Parking with id ${id} has been modified by another process`,
        );
      }

      this.eventPublisher.mergeObjectContext(parking);
      parking.deactivate();

      await this.parkingRepository.save(parking, { tx: prisma });

      const event = new IntegrationEvent<
        ParkingDeactivatedV1Payload,
        ParkingIntegrationEventTypes
      >(
        'parking.parking.deactivated.v1',
        {
          parkingId: parking.getId().value,
        },
        'parking',
        'Parking',
        parking.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: false }, prisma);

      parking.commit();

      return parking.getId().value;
    });
  }
}
