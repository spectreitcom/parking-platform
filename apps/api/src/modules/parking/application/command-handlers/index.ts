import { CreatePlaceTypeCommandHandler } from './create-place-type-command-handler';
import { UpdatePlaceTypeCommandHandler } from './update-place-type-command-handler';
import { DeletePlaceTypeCommandHandler } from './delete-place-type-command-handler';
import { CreateParkingAddonCommandHandler } from './create-parking-addon.command-handler';
import { UpdateParkingAddonCommandHandler } from './update-parking-addon.command-handler';
import { DeleteParkingAddonCommandHandler } from './delete-parking-addon.command-handler';
import { CreatePlaceCommandHandler } from './create-place.command-handler';
import { UpdatePlaceCommandHandler } from './update-place.command-handler';
import { ActivatePlaceCommandHandler } from './activate-place.command-handler';
import { DeactivatePlaceCommandHandler } from './deactivate-place.command-handler';

export const commandHandlers = [
  CreatePlaceTypeCommandHandler,
  UpdatePlaceTypeCommandHandler,
  DeletePlaceTypeCommandHandler,
  CreateParkingAddonCommandHandler,
  UpdateParkingAddonCommandHandler,
  DeleteParkingAddonCommandHandler,
  CreatePlaceCommandHandler,
  UpdatePlaceCommandHandler,
  ActivatePlaceCommandHandler,
  DeactivatePlaceCommandHandler,
];
