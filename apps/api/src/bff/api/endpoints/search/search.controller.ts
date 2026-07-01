import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchQueryParamsDto } from './dto/search-query-params.dto';
import { SearchHandler } from './handlers/search.handler';
import { SearchResponseDto } from './dto/search-response.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchHandler: SearchHandler) {}

  @ApiOperation({ summary: 'Search parkings' })
  @ApiOkResponse({ type: SearchResponseDto, isArray: true })
  @Get()
  async search(@Query() queryParams: SearchQueryParamsDto) {
    return await this.searchHandler.handle(queryParams);
  }
}
