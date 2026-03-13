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

  it('should create a parking', async () => {
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

    expect(publisher.mergeObjectContext).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(expect.any(Parking), {
      isNew: true,
    });
  });
});
