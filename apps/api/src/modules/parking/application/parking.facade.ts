import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePlaceTypeCommand } from './commands/create-place-type.command';
import { UpdatePlaceTypeCommand } from './commands/update-place-type.command';
import { DeletePlaceTypeCommand } from './commands/delete-place-type.command';
import { CreateParkingAddonCommand } from './commands/create-parking-addon.command';
import { UpdateParkingAddonCommand } from './commands/update-parking-addon.command';
import { DeleteParkingAddonCommand } from './commands/delete-parking-addon.command';
import { CreatePlaceCommand } from './commands/create-place.command';
import { UpdatePlaceCommand } from './commands/update-place.command';
import { ActivatePlaceCommand } from './commands/activate-place.command';
import { DeactivatePlaceCommand } from './commands/deactivate-place.command';

@Injectable()
export class ParkingFacade {
  constructor(private readonly commandBus: CommandBus) {}

  async createPlaceType(name: string) {
    const command = new CreatePlaceTypeCommand(name);
    return await this.commandBus.execute<CreatePlaceTypeCommand, string>(
      command,
    );
  }

  async updatePlaceType(id: string, name: string, version: number) {
    const command = new UpdatePlaceTypeCommand(id, name, version);
    return await this.commandBus.execute<UpdatePlaceTypeCommand, string>(
      command,
    );
  }

  async deletePlaceType(id: string, version: number) {
    const command = new DeletePlaceTypeCommand(id, version);
    return await this.commandBus.execute<DeletePlaceTypeCommand, string>(
      command,
    );
  }

  async createParkingAddon(code: string, name: string, price: number) {
    const command = new CreateParkingAddonCommand(code, name, price);
    return await this.commandBus.execute<CreateParkingAddonCommand, string>(
      command,
    );
  }

  async deleteParkingAddon(id: string, version: number) {
    const command = new DeleteParkingAddonCommand(id, version);
    return await this.commandBus.execute<DeleteParkingAddonCommand, string>(
      command,
    );
  }

  async updateParkingAddon(
    id: string,
    name: string,
    price: number,
    version: number,
  ) {
    const command = new UpdateParkingAddonCommand(id, name, price, version);
    return await this.commandBus.execute<UpdateParkingAddonCommand, string>(
      command,
    );
  }

  async createPlace(
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    active: boolean,
    address: string,
  ) {
    const command = new CreatePlaceCommand(
      name,
      latitude,
      longitude,
      placeTypeId,
      active,
      address,
    );
    return await this.commandBus.execute<CreatePlaceCommand, string>(command);
  }

  async updatePlace(
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    address: string,
    version: number,
  ) {
    const command = new UpdatePlaceCommand(
      id,
      name,
      latitude,
      longitude,
      placeTypeId,
      address,
      version,
    );
    return await this.commandBus.execute<UpdatePlaceCommand, string>(command);
  }

  async activatePlace(id: string, version: number) {
    const command = new ActivatePlaceCommand(id, version);
    return await this.commandBus.execute<ActivatePlaceCommand, string>(command);
  }

  async deactivatePlace(id: string, version: number) {
    const command = new DeactivatePlaceCommand(id, version);
    return await this.commandBus.execute<DeactivatePlaceCommand, string>(
      command,
    );
  }
}
