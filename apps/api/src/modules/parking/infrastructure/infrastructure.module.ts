import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { ParkingTypeRepository } from '../application/ports/parking-type.repository';
import { PrismaParkingTypeRepository } from './persistence/prisma-parking-type.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ParkingTypeRepository,
      useClass: PrismaParkingTypeRepository,
    },
  ],
  exports: [ParkingTypeRepository],
})
export class InfrastructureModule {}
