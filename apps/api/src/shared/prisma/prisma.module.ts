import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRunner } from './transaction-runner';
import { PrismaTransactionRunner } from './prisma-transaction-runner';

@Module({
  providers: [
    PrismaService,
    {
      provide: TransactionRunner,
      useClass: PrismaTransactionRunner,
    },
  ],
  exports: [PrismaService, TransactionRunner],
})
export class PrismaModule {}
