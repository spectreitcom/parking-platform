import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAssetImageQueryDto } from './dto/get-asset-image-query.dto';
import { GetAssetImageHandler } from './handlers/get-asset-image.handler';
import { UploadAssetHandler } from './handlers/upload-asset.handler';
import { CurrentManagerUser } from 'src/bff/manager-api/auth/decorators/current-manager-user.decorator';
import type { RequestUser } from 'src/bff/manager-api/auth/types';

@ApiBearerAuth('manager-auth')
@ApiTags('Assets')
@UseGuards(JwtAuthGuard)
@Controller('manager/assets')
export class AssetsController {
  constructor(
    private readonly getAssetImageHandler: GetAssetImageHandler,
    private readonly uploadAssetHandler: UploadAssetHandler,
  ) {}

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
    return await this.uploadAssetHandler.handle(file);
  }

  @ApiOperation({ summary: 'Get an image asset' })
  @ApiOkResponse({
    description: 'Returns the image asset',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid asset ID or query parameters.',
  })
  @ApiNotFoundResponse({
    description: 'Asset not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. Please provide a valid JWT token.',
  })
  @Get(':assetId')
  async getAssetImage(
    @Param('assetId', new ParseUUIDPipe()) assetId: string,
    @Query() query: GetAssetImageQueryDto,
    @Res() res: Response,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    const { buffer, mimeType, etag, cacheControl } =
      await this.getAssetImageHandler.handle(
        assetId,
        managerUser,
        query.width,
        query.height,
      );

    res.set('Content-Type', mimeType);
    res.set('ETag', etag);
    res.set('Cache-Control', cacheControl);

    res.send(buffer);
  }
}
