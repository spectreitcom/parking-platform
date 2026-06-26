import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingForManagerCommand } from '../commands/update-parking-for-manager.command';
import { ParkingRepository } from '../ports/parking.repository';
import { AppError } from 'src/shared/errors';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { Parking } from 'src/modules/parking/domain/parking';
import { PrismaTx } from 'src/shared/prisma/types';
import { DistanceCalculator } from 'src/modules/parking/application/ports/distance-calculator';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingUpdatedV1Payload,
} from '@repo/api-contracts';

@CommandHandler(UpdateParkingForManagerCommand)
export class UpdateParkingForManagerCommandHandler implements ICommandHandler<
  UpdateParkingForManagerCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly distanceCalculator: DistanceCalculator,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: UpdateParkingForManagerCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const {
        id,
        name,
        parkingFeatureIds,
        parkingAddonIds,
        assetIds,
        version,
        statute,
        description,
      } = command;

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

      parking.update(
        name,
        parking.getAddress().value,
        {
          longitude: parking.getCoords().longitude,
          latitude: parking.getCoords().latitude,
        },
        assetIds,
        parkingFeatureIds,
        parkingAddonIds,
        parking.getPlaceId().value,
        parking.getOrganizationId().value,
        description,
        statute,
      );

      await this.parkingRepository.save(parking, { tx: prisma });

      const distance = await this.calcDistance(parking, prisma);
      const featureIdsSet = await this.getFeatureIds(parking, prisma);
      const features = await this.getFeatures(featureIdsSet, prisma);

      const event = new IntegrationEvent<
        ParkingUpdatedV1Payload,
        ParkingIntegrationEventTypes
      >(
        'parking.parking.updated.v1',
        {
          parkingId: parking.getId().value,
          placeId: parking.getPlaceId().value,
          latitude: parking.getCoords().latitude,
          longitude: parking.getCoords().longitude,
          assetIds: parking.getAssetIds().map((asset) => asset.value),
          name: parking.getName().value,
          active: parking.isActive(),
          distance,
          featureIds: Array.from(featureIdsSet),
          features,
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

  private async calcDistance(parking: Parking, prisma: PrismaTx) {
    let distance = 0;

    const placeReadRecord = await prisma.placeRead.findUnique({
      where: {
        placeId: parking.getPlaceId().value,
      },
    });

    if (placeReadRecord) {
      distance = this.distanceCalculator.calculate(
        parking.getCoords().latitude,
        parking.getCoords().longitude,
        placeReadRecord.latitude.toNumber(),
        placeReadRecord.longitude.toNumber(),
      );
    }

    return distance;
  }

  private async getFeatures(
    featureIdsSet: Set<string>,
    prisma: PrismaTx,
  ): Promise<{ name: string }[]> {
    const featureReadRecords = await prisma.parkingFeatureRead.findMany({
      where: { parkingFeatureId: { in: Array.from(featureIdsSet) } },
    });

    return featureReadRecords.map((feature) => ({
      name: feature.name,
    }));
  }

  private async getFeatureIds(
    parking: Parking,
    prisma: PrismaTx,
  ): Promise<Set<string>> {
    const parkingSpots = await prisma.parkingSpotRead.findMany({
      where: { parkingId: parking.getId().value },
    });

    const featureIdsSet = new Set<string>();

    for (const featureId of parking
      .getParkingFeatureIds()
      .map((feature) => feature.value)) {
      featureIdsSet.add(featureId);
    }

    for (const spot of parkingSpots) {
      for (const featureId of spot.parkingSpotFeatureIds) {
        featureIdsSet.add(featureId);
      }
    }

    return featureIdsSet;
  }
}
