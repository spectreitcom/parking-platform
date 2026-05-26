import {
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingSpotDto {
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

  @ApiProperty({
    description: 'Parking ID to which the spot belongs',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  readonly parkingId: string;

  constructor(parkingFeatureIds: string[], price: number, parkingId: string) {
    this.parkingFeatureIds = parkingFeatureIds;
    this.price = price;
    this.parkingId = parkingId;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid CreateParkingSpotDto');
    }
  }
}
