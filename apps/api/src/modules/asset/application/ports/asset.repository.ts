import { Asset } from '../../domain/asset';
import { RepositorySaveOptions } from 'src/shared/types';
import { PrismaTx } from 'src/shared/prisma/types';

export abstract class AssetRepository {
  abstract save(asset: Asset, options?: RepositorySaveOptions): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Asset | null>;
}
