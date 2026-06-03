import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { FileUploader } from '../application/ports/file-uploader';
import { S3FileUploader } from './s3-file-uploader';
import { ImageProcessing } from '../application/ports/image-processing';
import { SharpImageProcessing } from './sharp-image-processing';
import { AssetRepository } from '../application/ports/asset.repository';
import { PrismaAssetRepository } from './persistance/prisma-asset.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: FileUploader,
      useClass: S3FileUploader,
    },
    {
      provide: ImageProcessing,
      useClass: SharpImageProcessing,
    },
    {
      provide: AssetRepository,
      useClass: PrismaAssetRepository,
    },
  ],
  exports: [FileUploader, ImageProcessing, AssetRepository],
})
export class InfrastructureModule {}
