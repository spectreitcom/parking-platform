import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { ParkingTypeRepository } from '../application/ports/parking-type.repository';
import { PrismaParkingTypeRepository } from './persistence/prisma-parking-type.repository';
import { ParkingAddonRepository } from '../application/ports/parking-addon.repository';
import { PrismaParkingAddonRepository } from './persistence/prisma-parking-addon.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ParkingTypeRepository,
      useClass: PrismaParkingTypeRepository,
    },
    {
      provide: ParkingAddonRepository,
      useClass: PrismaParkingAddonRepository,
    },
  ],
  exports: [ParkingTypeRepository, ParkingAddonRepository],
})
export class InfrastructureModule {}
