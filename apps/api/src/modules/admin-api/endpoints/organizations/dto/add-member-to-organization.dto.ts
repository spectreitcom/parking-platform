import { IsBoolean, IsInt, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberToOrganizationDto {
  @ApiProperty({
    description: 'The organization user id',
    format: 'uuid',
  })
  @IsUUID()
  readonly organizationUserId: string;

  @ApiProperty({
    description: 'Is the user a root user',
    format: 'boolean',
  })
  @IsBoolean()
  readonly isRoot: boolean;

  @ApiProperty({
    description: 'The version of the organization',
    format: 'integer',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(organizationUserId: string, isRoot: boolean, version: number) {
    this.organizationUserId = organizationUserId;
    this.isRoot = isRoot;
    this.version = version;
  }
}
