import { PrismaPlaceTypeRepository } from '../prisma-place-type.repository';
import { ConcurrencyError } from '../../../../../shared/errors';
import { PlaceType } from '../../../domain/place-type';
import { PlaceTypeId } from '../../../domain/value-objects/place-type-id';
import { PlaceTypeName } from '../../../domain/value-objects/place-type-name';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';

const createPrismaMock = () => {
  return {
    placeType: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as any;
};

describe('PrismaPlaceTypeRepository.save concurrency protection', () => {
  it('throws ConcurrencyError when record is missing and version > 1 (concurrent delete/update)', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.placeType.findUnique.mockResolvedValue(null);

    const repo = new PrismaPlaceTypeRepository(prismaMock);

    const aggregate = new PlaceType(
      PlaceTypeId.create(),
      PlaceTypeName.fromString('Type A'),
      AggregateVersion.fromNumber(2),
    );

    await expect(repo.save(aggregate)).rejects.toBeInstanceOf(ConcurrencyError);
    expect(prismaMock.placeType.create).not.toHaveBeenCalled();
    expect(prismaMock.placeType.update).not.toHaveBeenCalled();
  });

  it('allows create when version === 1 (new aggregate)', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.placeType.findUnique.mockResolvedValue(null);

    const repo = new PrismaPlaceTypeRepository(prismaMock);

    const aggregate = new PlaceType(
      PlaceTypeId.create(),
      PlaceTypeName.fromString('New Type'),
      AggregateVersion.fromNumber(1),
    );

    await repo.save(aggregate);

    expect(prismaMock.placeType.create).toHaveBeenCalledTimes(1);
    const args = prismaMock.placeType.create.mock.calls[0][0];
    expect(args.data).toMatchObject({
      name: 'New Type',
      version: 1,
    });
  });
});
