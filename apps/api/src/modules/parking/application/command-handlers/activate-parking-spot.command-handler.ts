import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivateParkingSpotCommand } from '../commands/activate-parking-spot.command';
import { ParkingSpotRepository } from '../ports/parking-spot.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ParkingRepository } from '../ports/parking.repository';
import { OrganizationId } from '../../domain/value-objects/organization-id';

@CommandHandler(ActivateParkingSpotCommand)
export class ActivateParkingSpotCommandHandler implements ICommandHandler<
  ActivateParkingSpotCommand,
  string
> {
  constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly parkingRepository: ParkingRepository,
  ) {}

  async execute(command: ActivateParkingSpotCommand): Promise<string> {
    const { id, version, organizationId } = command;

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
    parkingSpot.activate();

    await this.parkingSpotRepository.save(parkingSpot);
    parkingSpot.commit();

    return parkingSpot.getId().value;
  }
}
