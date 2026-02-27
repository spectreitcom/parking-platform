import { Injectable } from '@nestjs/common';
import { TransactionRunner } from './transaction-runner';
import { PrismaService } from './prisma.service';
import { PrismaTx } from './types';

@Injectable()
export class PrismaTransactionRunner implements TransactionRunner {
  constructor(private readonly prismaService: PrismaService) {}

  async runInTransaction<T>(
    callback: (prisma: PrismaTx) => Promise<T>,
  ): Promise<T> {
    return this.prismaService.$transaction(callback);
  }
}
