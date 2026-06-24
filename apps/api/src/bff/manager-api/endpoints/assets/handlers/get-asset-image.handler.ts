import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AssetFacade } from 'src/modules/asset/application/asset.facade';
import { QueryAssetResponse } from 'src/modules/asset/types';

@Injectable()
export class GetAssetImageHandler implements IControllerHandler {
  constructor(private readonly assetFacade: AssetFacade) {}

  async handle(
    assetId: string,
    width?: number,
    height?: number,
  ): Promise<QueryAssetResponse> {
    return await this.assetFacade.getAssetImage(assetId, width, height);
  }
}
