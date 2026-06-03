import { ICommand } from '@nestjs/cqrs';
import { UploadValidationStrategy } from '../upload-validation-strategies';

export class UploadAssetCommand implements ICommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly uploadValidationStrategy: UploadValidationStrategy,
  ) {}
}
