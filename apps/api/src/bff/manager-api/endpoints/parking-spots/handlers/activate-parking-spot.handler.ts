import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import type { RequestUser } from 'src/bff/manager-api/auth/types';
import { ActivateOrDeactivateParkingSpotDto } from '../dto/activate-or-deactivate-parking-spot.dto';
import { ActivateAndDeactivateParkingSpotService } from './shared/activate-and-deactivate-parking-spot.service';

@Injectable()
export class ActivateParkingSpotHandler implements IControllerHandler {
  constructor(
    private readonly activateAndDeactivateParkingSpotService: ActivateAndDeactivateParkingSpotService,
  ) {}

  async handle(
    parkingSpotId: string,
    dto: ActivateOrDeactivateParkingSpotDto,
    managerUser: RequestUser,
  ) {
    return await this.activateAndDeactivateParkingSpotService.activate(
      parkingSpotId,
      dto,
      managerUser,
    );
  }
}
