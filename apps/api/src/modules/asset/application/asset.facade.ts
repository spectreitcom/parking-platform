import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadAssetCommand } from './commands/upload-asset.command';
import { GetAssetQuery } from './queries/get-asset.query';
import { GetAssetImageQuery } from './queries/get-asset-image.query';
import { QueryAssetResponse, UploadValidationStrategyOptions } from '../types';
import {
  AllValidationStrategy,
  OnlyImageValidationStrategy,
  UploadValidationStrategy,
} from './upload-validation-strategies';

@Injectable()
export class AssetFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async uploadAsset(
    file: Express.Multer.File,
    uploadValidationOption: UploadValidationStrategyOptions,
  ) {
    const strategy = this.getValidationStrategy(uploadValidationOption);
    const command = new UploadAssetCommand(file, strategy);
    return await this.commandBus.execute<UploadAssetCommand, string>(command);
  }

  async getAsset(assetId: string) {
    return await this.queryBus.execute<GetAssetQuery, QueryAssetResponse>(
      new GetAssetQuery(assetId),
    );
  }

  async getAssetImage(assetId: string, width?: number, height?: number) {
    return await this.queryBus.execute<GetAssetImageQuery, QueryAssetResponse>(
      new GetAssetImageQuery(assetId, width, height),
    );
  }

  private getValidationStrategy(
    uploadValidationOption: UploadValidationStrategyOptions,
  ): UploadValidationStrategy {
    switch (uploadValidationOption) {
      default:
      case 'all':
        return new AllValidationStrategy();
      case 'onlyImage':
        return new OnlyImageValidationStrategy();
    }
  }
}
