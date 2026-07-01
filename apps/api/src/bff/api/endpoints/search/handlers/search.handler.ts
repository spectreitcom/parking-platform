import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { SearchQueryParamsDto } from '../dto/search-query-params.dto';
import { SearchFacade } from 'src/modules/search/application/search.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { AppError } from 'src/shared/errors';
import { SearchResponseDto } from '../dto/search-response.dto';

@Injectable()
export class SearchHandler implements IControllerHandler {
  constructor(
    private readonly searchFacade: SearchFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(
    queryParams: SearchQueryParamsDto,
  ): Promise<SearchResponseDto[]> {
    if (queryParams.arrival < Date.now()) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Arrival date cannot be in the past',
      );
    }

    if (queryParams.departure <= queryParams.arrival) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Departure date must be after arrival date',
      );
    }

    const parkingRecords = await this.searchFacade.search(
      queryParams.placeId,
      queryParams.featureIds ?? [],
    );

    const days = Math.ceil(
      (queryParams.departure - queryParams.arrival) / (1000 * 60 * 60 * 24),
    );

    const result: SearchResponseDto[] = [];

    for (const parkingRecord of parkingRecords) {
      const parkingSpotPrice =
        await this.parkingFacade.calculatePriceForParking(
          parkingRecord.parkingId,
          days,
        );

      result.push({
        parkingId: parkingRecord.parkingId,
        parkingSpotId: parkingSpotPrice?.parkingSpotId ?? null,
        parkingName: parkingRecord.name,
        assetIds: parkingRecord.assetIds,
        features: parkingRecord.features,
        distance: parkingRecord.distance,
        totalPrice: parkingSpotPrice?.totalPrice ?? null,
        totalPricePLN: parkingSpotPrice?.totalPricePLN ?? null,
      });
    }

    return result;
  }
}
