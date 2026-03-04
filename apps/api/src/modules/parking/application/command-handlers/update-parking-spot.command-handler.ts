import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingSpotCommand } from '../commands/update-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError, ConcurrencyError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ParkingRepository } from '../ports/parking.repository';
import { OwnerId } from '../../domain/value-objects/owner-id';

@CommandHandler(UpdateParkingSpotCommand)
export class UpdateParkingSpotCommandHandler implements ICommandHandler<
  UpdateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly parkingRepository: ParkingRepository,
  ) {}

  async execute(command: UpdateParkingSpotCommand): Promise<string> {
    const { id, price, parkingSpotFeatureIds, version, parkingOwnerId } =
      command;

    const parkingSpot = await this.parkingSpotRepository.findById(id);

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

    const _parkingOwnerId = OwnerId.fromString(parkingOwnerId);

    if (!parking.getOwnerId().equals(_parkingOwnerId)) {
      throw new AppError(
        'FORBIDDEN_OPERATION',
        `You are not the owner of this parking`,
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
      await this.parkingSpotRepository.save(parkingSpot);
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
  }
}
