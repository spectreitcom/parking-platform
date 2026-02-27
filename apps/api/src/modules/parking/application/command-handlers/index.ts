import { CreateParkingTypeCommandHandler } from './create-parking-type.command-handler';
import { UpdateParkingTypeCommandHandler } from './update-parking-type.command-handler';
import { DeleteParkingTypeCommandHandler } from './delete-parking-type.command-handler';
import { CreateParkingAddonCommandHandler } from './create-parking-addon.command-handler';
import { UpdateParkingAddonCommandHandler } from './update-parking-addon.command-handler';
import { DeleteParkingAddonCommandHandler } from './delete-parking-addon.command-handler';

export const commandHandlers = [
  CreateParkingTypeCommandHandler,
  UpdateParkingTypeCommandHandler,
  DeleteParkingTypeCommandHandler,
  CreateParkingAddonCommandHandler,
  UpdateParkingAddonCommandHandler,
  DeleteParkingAddonCommandHandler,
];
