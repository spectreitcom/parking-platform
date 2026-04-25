import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminChangePasswordDto {
  @ApiProperty({
    description: 'The existing password',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly existingPassword: string;

  @ApiProperty({
    description: 'The new password',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly newPassword: string;

  constructor(existingPassword: string, newPassword: string) {
    this.existingPassword = existingPassword;
    this.newPassword = newPassword;
  }
}
