import { AppError } from 'src/shared/errors';

export abstract class UploadValidationStrategy {
  abstract validate(file: Express.Multer.File): void;
}

export class OnlyImageValidationStrategy extends UploadValidationStrategy {
  validate(file: Express.Multer.File) {
    if (file.size > 1024 * 1024 * 2)
      throw new AppError('VALIDATION_ERROR', 'File size exceeds 2MB limit');
    if (!file.mimetype.includes('image'))
      throw new AppError('VALIDATION_ERROR', 'File is not an image');
  }
}

export class AllValidationStrategy extends UploadValidationStrategy {
  validate(file: Express.Multer.File) {
    if (file.size > 1024 * 1024 * 2)
      throw new AppError('VALIDATION_ERROR', 'File size exceeds 2MB limit');
  }
}
