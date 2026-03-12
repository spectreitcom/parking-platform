import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { OrganizationRepository } from '../application/ports/organization.repository';
import { PrismaOrganizationRepository } from './persistence/prisma-organization.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
  ],
  exports: [OrganizationRepository],
})
export class InfrastructureModule {}
