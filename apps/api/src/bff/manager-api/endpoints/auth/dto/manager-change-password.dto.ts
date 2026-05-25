import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ManagerChangePasswordDto {
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
