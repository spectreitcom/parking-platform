import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteOrganizationUserDto {
  @ApiProperty({
    description: 'The email address of the organization user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @ApiProperty({
    description: 'The display name of the organization user',
    example: 'Organization User',
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
