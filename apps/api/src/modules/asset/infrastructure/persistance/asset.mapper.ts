import { Asset } from '../../domain/asset';
import { AssetId } from '../../domain/value-objects/asset-id';
import { AssetMimeType } from '../../domain/value-objects/asset-mime-type';
import { Asset as AssetModel } from '@prisma/client';

export class AssetMapper {
  static toDomain(raw: AssetModel): Asset {
    return Asset.reconstruct(
      AssetId.fromString(raw.id),
      raw.key,
      AssetMimeType.fromString(raw.mimeType),
    );
  }

  static toPersistence(asset: Asset) {
    return {
      id: asset.getId().value,
      key: asset.getKey(),
      mimeType: asset.getMimeType().value,
    };
  }
}
