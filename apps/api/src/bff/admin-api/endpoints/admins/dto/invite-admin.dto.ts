import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminDto {
  @ApiProperty({
    description: 'The email address of the admin',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @ApiProperty({
    description: 'The display name of the admin',
    example: 'Admin User',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  readonly displayName: string;

  constructor(email: string, displayName: string) {
    this.email = email;
    this.displayName = displayName;
  }
}
