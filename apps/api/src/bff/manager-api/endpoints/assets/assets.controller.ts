import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssetFacade } from 'src/modules/asset/application/asset.facade';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('manager-auth')
@ApiTags('Assets')
@UseGuards(JwtAuthGuard)
@Controller('manager/assets')
export class AssetsController {
  constructor(private readonly assetFacade: AssetFacade) {}

  @ApiOperation({ summary: 'Upload an image asset' })
  @ApiCreatedResponse({
    description: 'Returns the ID of the uploaded image asset',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid file format or size. Please upload a valid image file (PNG, JPEG, WEBP, GIF, TIFF) with a maximum size of 2MB.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. Please provide a valid JWT token.',
  })
  @ApiParam({
    name: 'file',
    description: 'The image file to upload',
    required: true,
    type: 'file',
  })
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|jpeg|webp|gif|tiff)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const id = await this.assetFacade.uploadAsset(file, 'onlyImage');
    return {
      id,
    };
  }
}
