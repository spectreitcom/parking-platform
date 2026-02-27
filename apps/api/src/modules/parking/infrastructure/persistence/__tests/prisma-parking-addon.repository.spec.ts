import { Test, TestingModule } from '@nestjs/testing';
import { PrismaParkingAddonRepository } from '../prisma-parking-addon.repository';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { ParkingAddon } from '../../../domain/parking-addon';

describe('PrismaParkingAddonRepository', () => {
  let repository: PrismaParkingAddonRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaParkingAddonRepository,
        {
          provide: PrismaService,
          useValue: {
            parkingAddon: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaParkingAddonRepository>(
      PrismaParkingAddonRepository,
    );
    prismaService = module.get(PrismaService);
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  describe('save', () => {
    it('should upsert parking addon', async () => {
      const addon = ParkingAddon.create('PA1', 'Premium', 1000);

      await repository.save(addon);

      expect(prismaService.parkingAddon.upsert).toHaveBeenCalledWith({
        where: { id: addon.getId().value },
        update: {
          code: 'PA1',
          name: 'Premium',
          price: 1000,
        },
        create: {
          id: addon.getId().value,
          code: 'PA1',
          name: 'Premium',
          price: 1000,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return parking addon if found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const record = {
        id,
        code: 'PA1',
        name: 'Premium',
        price: 1000,
      };
      (prismaService.parkingAddon.findUnique as jest.Mock).mockResolvedValue(
        record,
      );

      const result = await repository.findById(id);

      expect(result).toBeInstanceOf(ParkingAddon);
      expect(result?.getId().value).toBe(id);
      expect(result?.getCode().value).toBe('PA1');
    });

    it('should return null if not found', async () => {
      (prismaService.parkingAddon.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  /* eslint-disable @typescript-eslint/unbound-method */
  describe('delete', () => {
    it('should delete parking addon', async () => {
      const id = 'some-uuid';

      await repository.delete(id);

      expect(prismaService.parkingAddon.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
