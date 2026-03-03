import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ActivateParkingCommand } from '../commands/activate-parking.command';
import { ParkingRepository } from '../ports/parking.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(ActivateParkingCommand)
export class ActivateParkingCommandHandler implements ICommandHandler<
  ActivateParkingCommand,
  string
> {
  constructor(
    private readonly parkingRepository: ParkingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ActivateParkingCommand): Promise<string> {
    const { id, version } = command;

    const parking = await this.parkingRepository.findById(id);

    if (!parking) {
      throw new AppError('ENTITY_NOT_FOUND', `Parking with id ${id} not found`);
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!parking.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Parking with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(parking);
    parking.activate();

    await this.parkingRepository.save(parking);
    parking.commit();

    return parking.getId().value;
  }
}
