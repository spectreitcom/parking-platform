import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetParkingReservationsQueryParamsDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly parkingId: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @IsInt()
  @Min(1)
  readonly page: number;

  @ApiProperty({ minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(parkingId: string, page: number, limit: number, search?: string) {
    this.parkingId = parkingId;
    this.page = page;
    this.limit = limit;
    this.search = search;
  }
}
