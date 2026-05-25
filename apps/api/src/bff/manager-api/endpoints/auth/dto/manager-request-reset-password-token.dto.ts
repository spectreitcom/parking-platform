import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ManagerRequestResetPasswordTokenDto {
  @ApiProperty({
    description: 'The email of the admin user',
    example: 'manager@example.com',
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
