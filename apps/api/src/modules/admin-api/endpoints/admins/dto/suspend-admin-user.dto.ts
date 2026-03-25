import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class SuspendAdminUserDto {
  @ApiProperty({
    description: 'The version of the admin user',
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
