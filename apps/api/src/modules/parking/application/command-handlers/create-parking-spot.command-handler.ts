import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingSpotCommand } from '../commands/create-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { ParkingSpot } from '../../domain/parking-spot';
import { OwnerId } from '../../domain/value-objects/owner-id';
import { AppError } from '../../../../shared/errors';
import { ParkingRepository } from '../ports/parking.repository';

@CommandHandler(CreateParkingSpotCommand)
export class CreateParkingSpotCommandHandler implements ICommandHandler<
  CreateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly parkingRepository: ParkingRepository,
  ) {}

  async execute(command: CreateParkingSpotCommand): Promise<string> {
    const { parkingId, price, parkingSpotFeatureIds, parkingOwnerId } = command;

    const parking = await this.parkingRepository.findById(parkingId);

    if (!parking) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking with id ${parkingId} not found`,
      );
    }

    const _parkingOwnerId = OwnerId.fromString(parkingOwnerId);

    if (!parking.getOwnerId().equals(_parkingOwnerId)) {
      throw new AppError(
        'FORBIDDEN_OPERATION',
        `You are not the owner of this parking`,
      );
    }

    const parkingSpot = this.eventPublisher.mergeObjectContext(
      ParkingSpot.create(parkingId, price, parkingSpotFeatureIds),
    );

    await this.parkingSpotRepository.save(parkingSpot, {
      isNew: true,
    });
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
