import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchQuery } from '../queries/search.query';
import { SearchItemReadModel } from './read-models/search-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { z } from 'zod';

const featuresSchema = z.array(z.object({ name: z.string() }));
const addonsSchema = z.array(z.object({ name: z.string() }));

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
        active: true,

        featureIds: featureIds.length
          ? {
              hasSome: featureIds,
            }
          : undefined,
      },
      take: 40,
      orderBy: { order: 'asc' },
    });

    return records.map((record) => {
      let features: { name: string }[] = [];
      let addons: { name: string }[] = [];

      const featuresValidationResult = featuresSchema.safeParse(
        record.features,
      );

      if (featuresValidationResult.success) {
        features = featuresValidationResult.data;
      }

      const addonsValidationResult = addonsSchema.safeParse(record.addons);

      if (addonsValidationResult.success) {
        addons = addonsValidationResult.data;
      }

      return new SearchItemReadModel(
        record.parkingId,
        record.name,
        features,
        record.featureIds,
        addons,
        record.addonIds,
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
