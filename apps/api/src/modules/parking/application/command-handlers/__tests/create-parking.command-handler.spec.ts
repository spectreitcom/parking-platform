import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateParkingCommandHandler } from '../create-parking.command-handler';
import { CreateParkingCommand } from '../../commands/create-parking.command';
import { ParkingRepository } from '../../ports/parking.repository';
import { Parking } from '../../../domain/parking';
import { randomUUID } from 'node:crypto';

describe('CreateParkingCommandHandler', () => {
  let handler: CreateParkingCommandHandler;
  let repository: jest.Mocked<ParkingRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParkingCommandHandler,
        {
          provide: ParkingRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn(<T>(obj: T): T => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateParkingCommandHandler>(
      CreateParkingCommandHandler,
    );
    repository = module.get(ParkingRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new parking', async () => {
    const command = new CreateParkingCommand(
      randomUUID(),
      'Test Parking',
      'Test Address',
      21.0122,
      52.2297,
      randomUUID(),
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(
      expect.any(Parking),
    );
    expect(repository.save).toHaveBeenCalledWith(expect.any(Parking));
    /* eslint-enable @typescript-eslint/unbound-method */
    const savedParking = repository.save.mock.calls[0][0];
    expect(savedParking.getName().value).toBe(command.name);
    expect(savedParking.getAddress().value).toBe(command.address);
    expect(savedParking.getCoords().latitude).toBe(command.latitude);
    expect(savedParking.getCoords().longitude).toBe(command.longitude);
    expect(savedParking.getOwnerId().value).toBe(command.ownerId);
    expect(savedParking.getPlaceId().value).toBe(command.placeId);
  });
});
