import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetDetailsQueryParamsDto } from 'src/bff/api/endpoints/parkings/dto/get-details-query-params.dto';
import { GetDetailsResponseDto } from './dto/get-details-response.dto';
import { GetDetailsHandler } from './handlers/get-details.handler';

@ApiTags('Parkings')
@Controller('parkings')
export class ParkingsController {
  constructor(private readonly getDetailsHandler: GetDetailsHandler) {}

  @ApiOperation({ summary: 'Returns the details of a parking' })
  @ApiOkResponse({ type: GetDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Get(':parkingId')
  async getDetails(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @Query() queryParams: GetDetailsQueryParamsDto,
  ) {
    return await this.getDetailsHandler.handle(parkingId, queryParams);
  }
}
