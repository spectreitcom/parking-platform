import { ApiProperty } from '@nestjs/swagger';

class GetDetailsOrganizationResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class GetDetailsParkingFeatureResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class GetDetailsPlaceResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly address: string;

  constructor(id: string, name: string, address: string) {
    this.id = id;
    this.name = name;
    this.address = address;
  }
}

class GetDetailsParkingSpotFeatureResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class GetDetailsParkingSpotResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty()
  readonly pricePerDay: number;

  @ApiProperty()
  readonly pricePerDayPLN: number;

  @ApiProperty()
  readonly available: boolean;

  @ApiProperty({ isArray: true, type: GetDetailsParkingSpotFeatureResponseDto })
  readonly parkingSpotFeatures: GetDetailsParkingSpotFeatureResponseDto[];

  @ApiProperty()
  readonly priceTotal: number;

  @ApiProperty()
  readonly priceTotalPLN: number;

  constructor(
    id: string,
    pricePerDay: number,
    pricePerDayPLN: number,
    available: boolean,
    parkingSpotFeatures: GetDetailsParkingSpotFeatureResponseDto[],
    priceTotal: number,
    priceTotalPLN: number,
  ) {
    this.id = id;
    this.pricePerDay = pricePerDay;
    this.pricePerDayPLN = pricePerDayPLN;
    this.available = available;
    this.parkingSpotFeatures = parkingSpotFeatures;
    this.priceTotal = priceTotal;
    this.priceTotalPLN = priceTotalPLN;
  }
}

export class GetDetailsResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  readonly parkingId: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: 'number' })
  readonly longitude: number;

  @ApiProperty({ type: 'number' })
  readonly latitude: number;

  @ApiProperty({ type: GetDetailsOrganizationResponseDto })
  readonly organization: GetDetailsOrganizationResponseDto;

  @ApiProperty({ isArray: true, type: String })
  readonly assetIds: string[];

  @ApiProperty({ isArray: true, type: GetDetailsParkingFeatureResponseDto })
  readonly parkingFeatures: GetDetailsParkingFeatureResponseDto[];

  @ApiProperty({ type: GetDetailsPlaceResponseDto })
  readonly place: GetDetailsPlaceResponseDto;

  @ApiProperty()
  readonly address: string;

  @ApiProperty({ isArray: true, type: GetDetailsParkingSpotResponseDto })
  readonly parkingSpots: GetDetailsParkingSpotResponseDto[];

  constructor(
    parkingId: string,
    name: string,
    longitude: number,
    latitude: number,
    organization: GetDetailsOrganizationResponseDto,
    assetIds: string[],
    parkingFeatures: GetDetailsParkingFeatureResponseDto[],
    place: GetDetailsPlaceResponseDto,
    address: string,
    parkingSpots: GetDetailsParkingSpotResponseDto[],
  ) {
    this.parkingId = parkingId;
    this.name = name;
    this.longitude = longitude;
    this.latitude = latitude;
    this.organization = organization;
    this.assetIds = assetIds;
    this.parkingFeatures = parkingFeatures;
    this.place = place;
    this.address = address;
    this.parkingSpots = parkingSpots;
  }
}
