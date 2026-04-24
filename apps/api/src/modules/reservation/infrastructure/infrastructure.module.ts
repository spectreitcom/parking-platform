import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ReservationRepository } from '../application/ports/reservation.repository';
import { PrismaReservationRepository } from './persistence/prisma-reservation.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ReservationRepository,
      useClass: PrismaReservationRepository,
    },
  ],
  exports: [ReservationRepository],
})
export class InfrastructureModule {}
