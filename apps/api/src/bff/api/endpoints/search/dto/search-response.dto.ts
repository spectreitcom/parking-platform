import { ApiProperty } from '@nestjs/swagger';

class SearchResponseFeatureDto {
  @ApiProperty()
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class SearchResponseDto {
  @ApiProperty()
  readonly parkingId: string;

  @ApiProperty({ nullable: true })
  readonly parkingSpotId: string | null;

  @ApiProperty()
  readonly parkingName: string;

  @ApiProperty({ isArray: true, type: String })
  readonly assetIds: string[];

  @ApiProperty({ isArray: true, type: SearchResponseFeatureDto })
  readonly features: SearchResponseFeatureDto[];

  @ApiProperty()
  readonly distance: number;

  @ApiProperty({ nullable: true })
  readonly totalPrice: number | null;

  @ApiProperty({ nullable: true })
  readonly totalPricePLN: number | null;

  constructor(
    parkingId: string,
    parkingSpotId: string | null,
    parkingName: string,
    assetIds: string[],
    features: SearchResponseFeatureDto[],
    distance: number,
    totalPrice: number | null,
    totalPricePLN: number | null,
  ) {
    this.parkingId = parkingId;
    this.parkingSpotId = parkingSpotId;
    this.parkingName = parkingName;
    this.assetIds = assetIds;
    this.features = features;
    this.distance = distance;
    this.totalPrice = totalPrice;
    this.totalPricePLN = totalPricePLN;
  }
}
