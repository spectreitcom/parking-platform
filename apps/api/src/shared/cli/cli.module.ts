import { Module } from '@nestjs/common';
import { SeedDatabaseCliCommand } from './seed-database.cli-command';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeedDatabaseCliCommand],
  exports: [SeedDatabaseCliCommand],
})
export class CliModule {}
