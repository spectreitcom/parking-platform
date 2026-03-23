import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceTypeDto {
  @ApiProperty({
    description: 'The name of the place type',
    example: 'Train station',
    required: true,
    maxLength: 60,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }
}
