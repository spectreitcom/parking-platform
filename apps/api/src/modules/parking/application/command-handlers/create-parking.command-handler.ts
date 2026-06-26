import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingCommand } from '../commands/create-parking.command';
import { ParkingRepository } from '../ports/parking.repository';
import { Parking } from '../../domain/parking';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingCreatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';
import { DistanceCalculator } from '../ports/distance-calculator';
import { PrismaTx } from 'src/shared/prisma/types';

@CommandHandler(CreateParkingCommand)
export class CreateParkingCommandHandler implements ICommandHandler<
  CreateParkingCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
    private readonly outboxService: OutboxService,
    private readonly distanceCalculator: DistanceCalculator,
  ) {}

  async execute(command: CreateParkingCommand): Promise<string> {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const { organizationId, name, address, longitude, latitude, placeId } =
        command;

      const parking = this.eventPublisher.mergeObjectContext(
        Parking.create(
          organizationId,
          name,
          address,
          { longitude, latitude },
          placeId,
        ),
      );

      await this.parkingRepository.save(parking, { isNew: true, tx: prisma });

      const distance = await this.calcDistance(parking, prisma);

      const event = new IntegrationEvent<
        ParkingCreatedV1Payload,
        ParkingIntegrationEventTypes
      >(
        'parking.parking.created.v1',
        {
          parkingId: parking.getId().value,
          longitude: parking.getCoords().longitude,
          latitude: parking.getCoords().latitude,
          placeId: parking.getPlaceId().value,
          active: parking.isActive(),
          name: parking.getName().value,
          distance,
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
        id: parking.getPlaceId().value,
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
}
