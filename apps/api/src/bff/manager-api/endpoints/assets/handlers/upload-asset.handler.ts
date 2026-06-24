import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AssetFacade } from 'src/modules/asset/application/asset.facade';

@Injectable()
export class UploadAssetHandler implements IControllerHandler {
  constructor(private readonly assetFacade: AssetFacade) {}

  async handle(file: Express.Multer.File): Promise<{ id: string }> {
    const id = await this.assetFacade.uploadAsset(file, 'onlyImage');
    return {
      id,
    };
  }
}
