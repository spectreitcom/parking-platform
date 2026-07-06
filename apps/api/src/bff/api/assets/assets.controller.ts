import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { GetAssetImageQueryDto } from './dto/get-asset-image-query.dto';
import type { Response } from 'express';
import { GetPublicAssetImageHandler } from './handlers/get-public-asset-image.handler';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly getPublicAssetImageHandler: GetPublicAssetImageHandler,
  ) {}

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
  @ApiNotFoundResponse({
    description: 'Asset not found.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid asset ID or query parameters.',
  })
  @Get(':assetId')
  async getAssetImage(
    @Param('assetId', new ParseUUIDPipe()) assetId: string,
    @Query() query: GetAssetImageQueryDto,
    @Res() res: Response,
  ) {
    const { buffer, mimeType, etag, cacheControl } =
      await this.getPublicAssetImageHandler.handle(
        assetId,
        query.width,
        query.height,
      );

    res.set('Content-Type', mimeType);
    res.set('ETag', etag);
    res.set('Cache-Control', cacheControl);

    res.send(buffer);
  }
}
