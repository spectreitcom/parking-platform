import { PrismaTx } from './types';

export abstract class TransactionRunner {
  abstract runInTransaction<T>(
    callback: (prisma: PrismaTx) => Promise<T>,
  ): Promise<T>;
}
