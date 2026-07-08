import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { GetDetailsQueryParamsDto } from '../dto/get-details-query-params.dto';
import { GetDetailsResponseDto } from '../dto/get-details-response.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { AppError } from 'src/shared/errors';
import { AvailabilityFacade } from 'src/modules/availability/application/availability.facade';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDetailsHandler implements IControllerHandler {
  constructor(
    private readonly parkingFacade: ParkingFacade,
    private readonly availabilityFacade: AvailabilityFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  async handle(
    parkingId: string,
    queryParams: GetDetailsQueryParamsDto,
  ): Promise<GetDetailsResponseDto> {
    if (queryParams.arrival * 1000 < Date.now()) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Arrival date cannot be in the past',
      );
    }

    if (queryParams.departure * 1000 <= queryParams.arrival * 1000) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Departure date must be after arrival date',
      );
    }

    const parking = await this.parkingFacade.getParkingById(parkingId);

    if (!parking || !parking.active) {
      throw new AppError('ENTITY_NOT_FOUND', 'Parking not found');
    }

    const days = Math.ceil(
      (queryParams.departure - queryParams.arrival) / (60 * 60 * 24),
    );

    const parkingSpots = await this.parkingFacade.getParkingSpotsByParkingId(
      parkingId,
      1,
      999,
    );

    const _parkingSpots: GetDetailsResponseDto['parkingSpots'] = [];

    const features = await this.parkingFacade.getParkingFeatureByIds([
      ...parking.parkingFeatureIds,
      ...parkingSpots.map((spot) => spot.parkingSpotFeatureIds).flat(),
    ]);

    const featuresMap = new Map(
      features.map((feature) => [feature.id, feature]),
    );

    const availability = await this.availabilityFacade.areAvailable(
      parkingSpots.map((spot) => spot.id),
    );

    const availabilityMap = new Map<string, boolean>(
      availability.map((item) => [item.parkingSpotId, item.available]),
    );

    for (const parkingSpot of parkingSpots) {
      const _priceTotal = await this.parkingFacade.calculatePriceForParking(
        parking.id,
        days,
      );

      const _features: GetDetailsResponseDto['parkingSpots'][number]['parkingSpotFeatures'] =
        parkingSpot.parkingSpotFeatureIds.map((id) => {
          const feature = featuresMap.get(id);
          return {
            id,
            name: feature?.name ?? '',
          };
        });

      _parkingSpots.push({
        id: parkingSpot.id,
        pricePerDay: parkingSpot.price,
        pricePerDayPLN: parkingSpot.pricePLN,
        priceTotal: _priceTotal?.totalPrice ?? 0,
        priceTotalPLN: _priceTotal?.totalPricePLN ?? 0,
        available: availabilityMap.get(parkingSpot.id) ?? true,
        parkingSpotFeatures: _features,
      });
    }

    const _parkingFeatures: GetDetailsResponseDto['parkingFeatures'] =
      parking.parkingFeatureIds.map((id) => {
        const feature = featuresMap.get(id);
        return {
          id,
          name: feature?.name ?? '',
        };
      });

    const places = await this.parkingFacade.getPlaceByIds([parking.placeId]);

    if (places.length === 0) {
      throw new AppError('ENTITY_NOT_FOUND', 'Place not found');
    }

    const organization =
      await this.organizationFacade.getOrganizationByIdForAdmin(
        parking.organizationId,
      );

    if (!organization) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization not found');
    }

    return {
      parkingId: parking.id,
      name: parking.name,
      longitude: parseFloat(parking.longitude.toFixed(7)),
      latitude: parseFloat(parking.latitude.toFixed(7)),
      address: parking.address,
      parkingSpots: _parkingSpots,
      parkingFeatures: _parkingFeatures,
      assetIds: parking.assetIds,
      place: {
        id: places[0].placeId,
        name: places[0].name,
        address: places[0].address,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
    } satisfies GetDetailsResponseDto;
  }
}
