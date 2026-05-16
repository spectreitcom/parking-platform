import { IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchOrganizationUsersQueryParamsDto {
  @ApiProperty({
    description: 'The search query',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  readonly search?: string;

  constructor(search?: string) {
    this.search = search;
  }
}
