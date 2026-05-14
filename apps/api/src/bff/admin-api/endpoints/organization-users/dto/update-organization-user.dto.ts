import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationUserDto {
  @ApiProperty({
    description: 'The display name of the organization user',
    example: 'Updated User Name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  readonly displayName: string;

  @ApiProperty({
    description: 'The version of the organization user',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  readonly version: number;

  constructor(displayName: string, version: number) {
    this.displayName = displayName;
    this.version = version;
  }
}
