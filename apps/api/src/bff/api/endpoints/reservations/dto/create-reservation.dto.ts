import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ReservationLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  constructor(title: string, price: number) {
    this.title = title;
    this.price = price;
  }
}

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly cartId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly parkingSpotId: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly startDate: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly endDate: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly registrationNumber: string;

  @ApiProperty({ type: [ReservationLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationLineDto)
  readonly lines: ReservationLineDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  readonly addons: string[];

  constructor(
    cartId: string,
    parkingSpotId: string,
    startDate: number,
    endDate: number,
    registrationNumber: string,
    lines: ReservationLineDto[],
    addons: string[],
  ) {
    this.cartId = cartId;
    this.parkingSpotId = parkingSpotId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.registrationNumber = registrationNumber;
    this.lines = lines;
    this.addons = addons;
  }
}
