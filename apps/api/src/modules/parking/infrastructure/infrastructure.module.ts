import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { PlaceTypeRepository } from '../application/ports/place-type.repository';
import { PrismaPlaceTypeRepository } from './persistence/prisma-place-type.repository';
import { ParkingAddonRepository } from '../application/ports/parking-addon.repository';
import { PrismaParkingAddonRepository } from './persistence/prisma-parking-addon.repository';
import { PlaceRepository } from '../application/ports/place.repository';
import { PrismaPlaceRepository } from './persistence/prisma-place.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PlaceTypeRepository,
      useClass: PrismaPlaceTypeRepository,
    },
    {
      provide: ParkingAddonRepository,
      useClass: PrismaParkingAddonRepository,
    },
    {
      provide: PlaceRepository,
      useClass: PrismaPlaceRepository,
    },
  ],
  exports: [PlaceTypeRepository, ParkingAddonRepository, PlaceRepository],
})
export class InfrastructureModule {}
