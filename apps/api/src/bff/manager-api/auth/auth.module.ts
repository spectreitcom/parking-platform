import { Module } from '@nestjs/common';
import { ManagerJwtStrategy } from './strategies/manager-jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';
import { ManagerLocalStrategy } from './strategies/manager-local.strategy';
import { OrganizationModule } from 'src/modules/organization/application/organization.module';

@Module({
  imports: [PassportModule, OrganizationUserIamModule, OrganizationModule],
  providers: [ManagerJwtStrategy, ManagerLocalStrategy],
})
export class AuthModule {}
