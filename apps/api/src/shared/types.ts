import { PrismaTx } from './prisma/types';

export type RepositorySaveOptions = {
  isNew?: boolean;
  tx?: PrismaTx;
};
