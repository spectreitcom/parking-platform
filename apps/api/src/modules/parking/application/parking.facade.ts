import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePlaceTypeCommand } from './commands/create-place-type.command';
import { UpdatePlaceTypeCommand } from './commands/update-place-type.command';
import { DeletePlaceTypeCommand } from './commands/delete-place-type.command';
import { CreateParkingAddonCommand } from './commands/create-parking-addon.command';
import { UpdateParkingAddonCommand } from './commands/update-parking-addon.command';
import { DeleteParkingAddonCommand } from './commands/delete-parking-addon.command';

@Injectable()
export class ParkingFacade {
  constructor(private readonly commandBus: CommandBus) {}

  async createPlaceType(name: string) {
    const command = new CreatePlaceTypeCommand(name);
    return await this.commandBus.execute<CreatePlaceTypeCommand, string>(
      command,
    );
  }

  async updatePlaceType(id: string, name: string) {
    const command = new UpdatePlaceTypeCommand(id, name);
    return await this.commandBus.execute<UpdatePlaceTypeCommand, string>(
      command,
    );
  }

  async deletePlaceType(id: string) {
    const command = new DeletePlaceTypeCommand(id);
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

  async deleteParkingAddon(id: string) {
    const command = new DeleteParkingAddonCommand(id);
    return await this.commandBus.execute<DeleteParkingAddonCommand, string>(
      command,
    );
  }

  async updateParkingAddon(id: string, name: string, price: number) {
    const command = new UpdateParkingAddonCommand(id, name, price);
    return await this.commandBus.execute<UpdateParkingAddonCommand, string>(
      command,
    );
  }
}
