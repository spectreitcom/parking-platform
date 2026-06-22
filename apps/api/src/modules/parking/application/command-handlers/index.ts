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
import { CreateParkingFeatureCommandHandler } from './create-parking-feature.command-handler';
import { UpdateParkingFeatureCommandHandler } from './update-parking-feature.command-handler';
import { DeleteParkingFeatureCommandHandler } from './delete-parking-feature.command-handler';
import { CreateParkingCommandHandler } from './create-parking.command-handler';
import { UpdateParkingCommandHandler } from './update-parking.command-handler';
import { ActivateParkingCommandHandler } from './activate-parking.command-handler';
import { DeactivateParkingCommandHandler } from './deactivate-parking.command-handler';
import { CreateParkingSpotCommandHandler } from './create-parking-spot.command-handler';
import { UpdateParkingSpotCommandHandler } from './update-parking-spot.command-handler';
import { ActivateParkingSpotCommandHandler } from './activate-parking-spot.command-handler';
import { DeactivateParkingSpotCommandHandler } from './deactivate-parking-spot.command-handler';
import { UpdateParkingForManagerCommandHandler } from './update-parking-for-manager.command-handler';

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
  CreateParkingFeatureCommandHandler,
  UpdateParkingFeatureCommandHandler,
  DeleteParkingFeatureCommandHandler,
  CreateParkingCommandHandler,
  UpdateParkingCommandHandler,
  ActivateParkingCommandHandler,
  DeactivateParkingCommandHandler,
  CreateParkingSpotCommandHandler,
  UpdateParkingSpotCommandHandler,
  ActivateParkingSpotCommandHandler,
  DeactivateParkingSpotCommandHandler,
  UpdateParkingForManagerCommandHandler,
];
