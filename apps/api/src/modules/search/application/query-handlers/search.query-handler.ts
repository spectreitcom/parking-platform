import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchQuery } from '../queries/search.query';
import { SearchItemReadModel } from 'src/modules/search/application/query-handlers/read-models/search-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { z } from 'zod';

const featuresSchema = z.array(z.object({ name: z.string() }));

@QueryHandler(SearchQuery)
export class SearchQueryHandler implements IQueryHandler<
  SearchQuery,
  SearchItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: SearchQuery): Promise<SearchItemReadModel[]> {
    const { placeId, featureIds } = query;

    const records = await this.prismaService.search.findMany({
      where: {
        placeId,
        featureIds: {
          hasSome: featureIds,
        },
      },
      take: 40,
      orderBy: { order: 'asc' },
    });

    return records.map((record) => {
      let features: { name: string }[] = [];

      const validationResult = featuresSchema.safeParse(record.features);

      if (validationResult.success) {
        features = validationResult.data;
      }

      return new SearchItemReadModel(
        record.parkingId,
        record.name,
        features,
        record.featureIds,
        record.order,
        record.hasAvailableParkingSpots,
        record.assetIds,
        record.active,
        record.placeId,
        record.longitude.toNumber(),
        record.latitude.toNumber(),
        record.distance,
      );
    });
  }
}
