import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserRefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'refresh-token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}
