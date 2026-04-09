import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveMemberFromOrganizationQueryParamsDto {
  @ApiProperty({
    description: 'The version of the organization',
    example: 1,
    format: 'int32',
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
