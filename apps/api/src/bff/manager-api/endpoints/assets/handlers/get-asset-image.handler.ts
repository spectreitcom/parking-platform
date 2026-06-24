import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AssetFacade } from 'src/modules/asset/application/asset.facade';
import { QueryAssetResponse } from 'src/modules/asset/types';
import { RequestUser } from 'src/bff/manager-api/auth/types';

@Injectable()
export class GetAssetImageHandler implements IControllerHandler {
  constructor(private readonly assetFacade: AssetFacade) {}

  async handle(
    assetId: string,
    managerUser: RequestUser,
    width?: number,
    height?: number,
  ): Promise<QueryAssetResponse & { cacheControl: string }> {
    const asset = await this.assetFacade.getAssetImage(
      assetId,
      managerUser.id,
      width,
      height,
    );

    return {
      ...asset,
      cacheControl: 'private, max-age=31536000',
    };
  }
}
