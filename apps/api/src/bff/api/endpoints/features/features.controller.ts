import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { FeatureResponseDto } from './dto/feature-response.dto';

@ApiTags('Features')
@Controller('features')
export class FeaturesController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Get all parking features',
  })
  @ApiOkResponse({
    description:
      'The list of parking features has been successfully retrieved.',
    type: FeatureResponseDto,
    isArray: true,
  })
  @Get()
  async getFeatures(): Promise<FeatureResponseDto[]> {
    const features = await this.parkingFacade.getParkingFeaturesList(1, 999);

    return features.map(
      (feature) => new FeatureResponseDto(feature.id, feature.name),
    );
  }
}
