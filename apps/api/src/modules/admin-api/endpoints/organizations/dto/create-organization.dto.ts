import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'My Organization',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The address of the organization',
    example: '123 Main St',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly address: string;

  @ApiProperty({
    description: 'The tax ID of the organization',
    example: '123456789',
    required: true,
    maxLength: 120,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  readonly taxId: string;

  constructor(name: string, address: string, taxId: string) {
    this.name = name;
    this.address = address;
    this.taxId = taxId;
  }
}
