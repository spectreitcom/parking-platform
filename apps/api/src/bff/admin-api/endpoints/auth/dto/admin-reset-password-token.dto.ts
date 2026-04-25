import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordTokenDto {
  @ApiProperty({
    description: 'The reset password token',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty({
    description: 'The new password',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  constructor(token: string, password: string) {
    this.token = token;
    this.password = password;
  }
}
