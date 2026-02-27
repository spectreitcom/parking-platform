import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateParkingTypeCommand } from './commands/create-parking-type.command';
import { UpdateParkingTypeCommand } from './commands/update-parking-type.command';
import { DeleteParkingTypeCommand } from './commands/delete-parking-type.command';

@Injectable()
export class ParkingFacade {
  constructor(private readonly commandBus: CommandBus) {}

  async createParkingType(name: string) {
    const command = new CreateParkingTypeCommand(name);
    return await this.commandBus.execute<CreateParkingTypeCommand, string>(
      command,
    );
  }

  async updateParkingType(id: string, name: string) {
    const command = new UpdateParkingTypeCommand(id, name);
    return await this.commandBus.execute<UpdateParkingTypeCommand, string>(
      command,
    );
  }

  async deleteParkingType(id: string) {
    const command = new DeleteParkingTypeCommand(id);
    return await this.commandBus.execute<DeleteParkingTypeCommand, string>(
      command,
    );
  }
}
