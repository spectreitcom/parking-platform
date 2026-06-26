import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingSpotCommand } from '../commands/create-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { ParkingSpot } from '../../domain/parking-spot';
import { OrganizationId } from '../../domain/value-objects/organization-id';
import { AppError } from 'src/shared/errors';
import { ParkingRepository } from '../ports/parking.repository';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingSpotCreatedV1Payload,
} from '@repo/api-contracts';

@CommandHandler(CreateParkingSpotCommand)
export class CreateParkingSpotCommandHandler implements ICommandHandler<
  CreateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly parkingRepository: ParkingRepository,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: CreateParkingSpotCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { parkingId, price, parkingSpotFeatureIds, organizationId } =
        command;

      const parking = await this.parkingRepository.findById(parkingId, prisma);

      if (!parking) {
        throw new AppError(
          'ENTITY_NOT_FOUND',
          `Parking with id ${parkingId} not found`,
        );
      }

      const _organizationId = OrganizationId.fromString(organizationId);

      if (!parking.getOrganizationId().equals(_organizationId)) {
        throw new AppError(
          'FORBIDDEN_OPERATION',
          `You are not authorized for this organization`,
        );
      }

      const parkingSpot = this.eventPublisher.mergeObjectContext(
        ParkingSpot.create(parkingId, price, parkingSpotFeatureIds),
      );

      await this.parkingSpotRepository.save(parkingSpot, {
        isNew: true,
        tx: prisma,
      });

      const featureIdsSet = new Set<string>();

      for (const featureId of parkingSpot
        .getParkingSpotFeatureIds()
        .map((featureId) => featureId.value)) {
        featureIdsSet.add(featureId);
      }

      const parkingSpotRecords = await prisma.parkingSpotRead.findMany({
        where: {
          parkingId: parkingSpot.getParkingId().value,
          parkingSpotId: { not: parkingSpot.getId().value },
        },
      });

      for (const featureId of parking
        .getParkingFeatureIds()
        .map((featureId) => featureId.value)) {
        featureIdsSet.delete(featureId);
      }

      for (const parkingSpotRecord of parkingSpotRecords) {
        for (const featureId of parkingSpotRecord.parkingSpotFeatureIds) {
          featureIdsSet.delete(featureId);
        }
      }

      const featureRecords = await prisma.parkingFeatureRead.findMany({
        where: {
          id: { in: Array.from(featureIdsSet) },
        },
      });

      const features: { name: string }[] = featureRecords.map((f) => ({
        name: f.name,
      }));

      const event = new IntegrationEvent<
        ParkingSpotCreatedV1Payload,
        ParkingIntegrationEventTypes
      >(
        'parking.parking-spot.created.v1',
        {
          parkingId: parkingSpot.getParkingId().value,
          price: parkingSpot.getPrice().value,
          parkingSpotId: parkingSpot.getId().value,
          featureIds: Array.from(featureIdsSet),
          features,
          active: parkingSpot.isActive(),
          pricePLN: parkingSpot.getPrice().toPLN(),
        },
        'parking',
        'ParkingSpot',
        parkingSpot.getId().value,
      );

      await this.outboxService.enqueue(event, { deduplicate: false }, prisma);

      parkingSpot.commit();

      return parkingSpot.getId().value;
    });
  }
}
