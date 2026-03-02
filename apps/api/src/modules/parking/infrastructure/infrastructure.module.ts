import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { PlaceTypeRepository } from '../application/ports/place-type.repository';
import { PrismaPlaceTypeRepository } from './persistence/prisma-place-type-repository.service';
import { ParkingAddonRepository } from '../application/ports/parking-addon.repository';
import { PrismaParkingAddonRepository } from './persistence/prisma-parking-addon.repository';

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
  ],
  exports: [PlaceTypeRepository, ParkingAddonRepository],
})
export class InfrastructureModule {}
