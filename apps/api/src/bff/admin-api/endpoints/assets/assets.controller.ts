import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { GetAssetImageQueryDto } from './dto/get-asset-image-query.dto';
import { GetAssetImageHandler } from './handlers/get-asset-image.handler';
import { CurrentAdminUserId } from 'src/bff/admin-api/auth/decorators/current-admin-user-id.decorator';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Assets')
@UseGuards(JwtAuthGuard)
@Controller('admin/assets')
export class AssetsController {
  constructor(private readonly getAssetImageHandler: GetAssetImageHandler) {}

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
    @CurrentAdminUserId() adminId: string,
  ) {
    const { buffer, mimeType, etag, cacheControl } =
      await this.getAssetImageHandler.handle(
        assetId,
        adminId,
        query.width,
        query.height,
      );

    res.set('Content-Type', mimeType);
    res.set('ETag', etag);
    res.set('Cache-Control', cacheControl);

    res.send(buffer);
  }
}
