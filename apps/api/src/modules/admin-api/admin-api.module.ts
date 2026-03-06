import { Module } from '@nestjs/common';
import { AdminIamModule } from '../admin-iam/application/admin-iam.module';
import { ParkingModule } from '../parking/application/parking.module';

@Module({
  imports: [AdminIamModule, ParkingModule],
})
export class AdminApiModule {}
