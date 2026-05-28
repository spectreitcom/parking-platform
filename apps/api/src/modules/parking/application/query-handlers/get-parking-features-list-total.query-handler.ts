import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParkingFeaturesListTotalQuery } from '../queries/get-parking-features-list-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getParkingFeaturesListQueryWhere } from './get-parking-features-list.query-handler';

@QueryHandler(GetParkingFeaturesListTotalQuery)
export class GetParkingFeaturesListTotalQueryHandler implements IQueryHandler<
  GetParkingFeaturesListTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetParkingFeaturesListTotalQuery): Promise<number> {
    const { search, levels } = query;

    return this.prismaService.parkingFeatureRead.count({
      where: getParkingFeaturesListQueryWhere(search, levels),
    });
  }
}
