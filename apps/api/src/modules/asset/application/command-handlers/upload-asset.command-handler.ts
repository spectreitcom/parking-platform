import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadAssetCommand } from '../commands/upload-asset.command';
import { FileUploader } from '../ports/file-uploader';
import { AssetRepository } from '../ports/asset.repository';
import { Asset } from '../../domain/asset';

@CommandHandler(UploadAssetCommand)
export class UploadAssetCommandHandler implements ICommandHandler<
  UploadAssetCommand,
  string
> {
  constructor(
    private readonly fileUploader: FileUploader,
    private readonly assetRepository: AssetRepository,
  ) {}

  async execute(command: UploadAssetCommand): Promise<string> {
    const { file, uploadValidationStrategy } = command;

    uploadValidationStrategy.validate(file);

    const key = await this.fileUploader.upload(file);

    const asset = Asset.create(key, file.mimetype);

    await this.assetRepository.save(asset, { isNew: true });

    return asset.getId().value;
  }
}
