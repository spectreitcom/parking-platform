import { AggregateRoot } from '@nestjs/cqrs';
import { AssetId } from './value-objects/asset-id';
import { AssetMimeType } from './value-objects/asset-mime-type';

export class Asset extends AggregateRoot {
  private readonly id: AssetId;
  private readonly key: string;
  private readonly mimeType: AssetMimeType;

  private constructor(id: AssetId, key: string, mimeType: AssetMimeType) {
    super();
    this.id = id;
    this.key = key;
    this.mimeType = mimeType;
  }

  static create(key: string, mimeType: string) {
    const id = AssetId.create();
    const _mimeType = AssetMimeType.fromString(mimeType);
    return new Asset(id, key, _mimeType);
  }

  static reconstruct(id: AssetId, key: string, mimeType: AssetMimeType) {
    return new Asset(id, key, mimeType);
  }

  getId() {
    return this.id;
  }

  getKey() {
    return this.key;
  }

  getMimeType() {
    return this.mimeType;
  }
}
