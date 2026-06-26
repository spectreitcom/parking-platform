import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SearchQuery } from './queries/search.query';
import { SearchItemReadModel } from './query-handlers/read-models/search-item.read-model';

@Injectable()
export class SearchFacade {
  constructor(private readonly queryBus: QueryBus) {}

  async search(placeId: string, featureIds: string[]) {
    const query = new SearchQuery(placeId, featureIds);
    return await this.queryBus.execute<SearchQuery, SearchItemReadModel[]>(
      query,
    );
  }
}
