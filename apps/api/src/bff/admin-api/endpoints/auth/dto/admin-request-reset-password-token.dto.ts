import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRequestResetPasswordTokenDto {
  @ApiProperty({
    description: 'The email of the admin user',
    example: 'admin@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}
