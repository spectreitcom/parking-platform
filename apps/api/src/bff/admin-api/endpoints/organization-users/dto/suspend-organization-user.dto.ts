import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class SuspendOrganizationUserDto {
  @ApiProperty({
    description: 'The version of the organization user',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
