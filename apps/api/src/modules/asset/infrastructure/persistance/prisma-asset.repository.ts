import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../../application/ports/asset.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { Asset } from '../../domain/asset';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AssetMapper } from './asset.mapper';
import { ConcurrencyError } from 'src/shared/errors';

@Injectable()
export class PrismaAssetRepository implements AssetRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(asset: Asset, options?: RepositorySaveOptions): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const isNew = options?.isNew ?? false;

    const { id, key, mimeType } = AssetMapper.toPersistence(asset);

    const record = await prisma.asset.findUnique({
      where: { id },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Asset', id);
      }

      await prisma.asset.create({
        data: { id, key, mimeType },
      });
      return;
    }

    if (isNew) {
      throw new ConcurrencyError('Asset', id);
    }

    await prisma.asset.update({
      where: { id },
      data: { key, mimeType },
    });
  }

  async findById(id: string, tx?: PrismaTx): Promise<Asset | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.asset.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return AssetMapper.toDomain(record);
  }
}
