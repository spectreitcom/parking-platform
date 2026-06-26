import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingSpotCommand } from '../commands/update-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError, ConcurrencyError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { ParkingRepository } from '../ports/parking.repository';
import { OrganizationId } from '../../domain/value-objects/organization-id';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingSpotUpdatedV1Payload,
} from '@repo/api-contracts';

@CommandHandler(UpdateParkingSpotCommand)
export class UpdateParkingSpotCommandHandler implements ICommandHandler<
  UpdateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly parkingRepository: ParkingRepository,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: UpdateParkingSpotCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { id, price, parkingSpotFeatureIds, version, organizationId } =
        command;

      const parkingSpot = await this.parkingSpotRepository.findById(id, prisma);

      if (!parkingSpot) {
        throw new AppError(
          'ENTITY_NOT_FOUND',
          `Parking spot with id ${id} not found`,
        );
      }

      const parking = await this.parkingRepository.findById(
        parkingSpot.getParkingId().value,
      );

      if (!parking) {
        throw new AppError(
          'ENTITY_NOT_FOUND',
          `Parking with id ${parkingSpot.getParkingId().value} not found`,
        );
      }

      const _organizationId = OrganizationId.fromString(organizationId);

      if (!parking.getOrganizationId().equals(_organizationId)) {
        throw new AppError(
          'FORBIDDEN_OPERATION',
          `You are not authorized for this organization`,
        );
      }

      const _version = AggregateVersion.fromNumber(version);

      if (!parkingSpot.getVersion().equals(_version)) {
        throw new AppError(
          'CONCURRENCY',
          `Parking spot with id ${id} has been modified by another process`,
        );
      }

      this.eventPublisher.mergeObjectContext(parkingSpot);
      parkingSpot.update(price, parkingSpotFeatureIds);

      try {
        await this.parkingSpotRepository.save(parkingSpot, { tx: prisma });

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
          ParkingSpotUpdatedV1Payload,
          ParkingIntegrationEventTypes
        >(
          'parking.parking-spot.updated.v1',
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
      } catch (e) {
        if (e instanceof ConcurrencyError) {
          throw new AppError(
            'CONCURRENCY',
            `Parking spot with id ${id} has been modified by another process`,
          );
        }
        throw e;
      }

      return parkingSpot.getId().value;
    });
  }
}
