import { CreatePlaceTypeCommandHandler } from './create-place-type-command.handler';
import { UpdatePlaceTypeCommandHandler } from './update-place-type-command.handler';
import { DeletePlaceTypeCommandHandler } from './delete-place-type-command.handler';
import { CreateParkingAddonCommandHandler } from './create-parking-addon.command-handler';
import { UpdateParkingAddonCommandHandler } from './update-parking-addon.command-handler';
import { DeleteParkingAddonCommandHandler } from './delete-parking-addon.command-handler';

export const commandHandlers = [
  CreatePlaceTypeCommandHandler,
  UpdatePlaceTypeCommandHandler,
  DeletePlaceTypeCommandHandler,
  CreateParkingAddonCommandHandler,
  UpdateParkingAddonCommandHandler,
  DeleteParkingAddonCommandHandler,
];
