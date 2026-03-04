import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { PlaceTypeRepository } from '../application/ports/place-type.repository';
import { PrismaPlaceTypeRepository } from './persistence/prisma-place-type.repository';
import { ParkingAddonRepository } from '../application/ports/parking-addon.repository';
import { PrismaParkingAddonRepository } from './persistence/prisma-parking-addon.repository';
import { PlaceRepository } from '../application/ports/place.repository';
import { PrismaPlaceRepository } from './persistence/prisma-place.repository';
import { ParkingFeatureRepository } from '../application/ports/parking-feature.repository';
import { PrismaParkingFeatureRepository } from './persistence/prisma-parking-feature.repository';
import { ParkingRepository } from '../application/ports/parking.repository';
import { PrismaParkingRepository } from './persistence/prisma-parking.repository';
import { ParkingSpotRepository } from '../application/ports/parking-spot.repository';
import { PrismaParkingSpotRepository } from './persistence/prisma-parking-spot.repository';

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
    {
      provide: ParkingFeatureRepository,
      useClass: PrismaParkingFeatureRepository,
    },
    {
      provide: ParkingRepository,
      useClass: PrismaParkingRepository,
    },
    {
      provide: ParkingSpotRepository,
      useClass: PrismaParkingSpotRepository,
    },
  ],
  exports: [
    PlaceTypeRepository,
    ParkingAddonRepository,
    PlaceRepository,
    ParkingFeatureRepository,
    ParkingRepository,
    ParkingSpotRepository,
  ],
})
export class InfrastructureModule {}
