import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';

@Module({
  imports: [AuthModule, OrganizationUserIamModule],
  controllers: [AuthController],
})
export class ManagerApiModule {}
