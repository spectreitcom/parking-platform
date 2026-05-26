import { IsArray, IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingSpotDto {
  @ApiProperty({
    description: 'List of parking feature IDs associated with the parking spot',
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly parkingFeatureIds: string[];

  @ApiProperty({
    description: 'Price per hour for parking spot',
    example: 10,
    minimum: 1,
    type: 'number',
  })
  @IsPositive()
  @IsNumber()
  readonly price: number;

  // todo;
  // @ApiProperty({
  //   description: 'Parking ID to which the spot belongs',
  //   type: 'string',
  //   format: 'uuid',
  // })
  // @IsUUID()
  // readonly parkingId: string;

  @ApiProperty({
    description:
      'Version of the parking spot for optimistic concurrency control',
    type: 'number',
    minimum: 1,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(
    parkingFeatureIds: string[],
    price: number,
    // parkingId: string,
    version: number,
  ) {
    this.parkingFeatureIds = parkingFeatureIds;
    this.price = price;
    // this.parkingId = parkingId;
    this.version = version;
  }
}
