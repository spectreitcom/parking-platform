import { PrismaParkingAddonRepository } from '../prisma-parking-addon.repository';
import { ConcurrencyError } from '../../../../../shared/errors';
import { ParkingAddon } from '../../../domain/parking-addon';
import { ParkingAddonId } from '../../../domain/value-objects/parking-addon-id';
import { ParkingAddonCode } from '../../../domain/value-objects/parking-addon-code';
import { ParkingAddonName } from '../../../domain/value-objects/parking-addon-name';
import { Money } from '../../../domain/value-objects/money';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';

// Minimal PrismaService mock shape used by the repository
const createPrismaMock = () => {
  return {
    parkingAddon: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as any;
};

describe('PrismaParkingAddonRepository.save concurrency protection', () => {
  it('throws ConcurrencyError when record is missing and version > 1 (concurrent delete/update)', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.parkingAddon.findUnique.mockResolvedValue(null);

    const repo = new PrismaParkingAddonRepository(prismaMock);

    // Build an aggregate that represents an already-persisted entity (version 2)
    const aggregate = new ParkingAddon(
      ParkingAddonId.create(),
      ParkingAddonCode.fromString('PA1'),
      ParkingAddonName.fromString('Addon'),
      Money.fromNumber(1000),
      AggregateVersion.fromNumber(2),
    );

    await expect(repo.save(aggregate)).rejects.toBeInstanceOf(ConcurrencyError);
    expect(prismaMock.parkingAddon.create).not.toHaveBeenCalled();
    expect(prismaMock.parkingAddon.update).not.toHaveBeenCalled();
  });

  it('allows create when version === 1 (new aggregate)', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.parkingAddon.findUnique.mockResolvedValue(null);

    const repo = new PrismaParkingAddonRepository(prismaMock);

    const aggregate = new ParkingAddon(
      ParkingAddonId.create(),
      ParkingAddonCode.fromString('PA2'),
      ParkingAddonName.fromString('New Addon'),
      Money.fromNumber(1500),
      AggregateVersion.fromNumber(1),
    );

    await repo.save(aggregate);

    expect(prismaMock.parkingAddon.create).toHaveBeenCalledTimes(1);
    const args = prismaMock.parkingAddon.create.mock.calls[0][0];
    expect(args.data).toMatchObject({
      code: 'PA2',
      name: 'New Addon',
      price: 1500,
      version: 1,
    });
  });
});
