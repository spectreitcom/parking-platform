import { ApiProperty } from '@nestjs/swagger';

export class FeatureResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the parking feature',
    format: 'uuid',
  })
  readonly id: string;

  @ApiProperty({
    description: 'The name of the parking feature',
    example: 'CCTV',
  })
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
