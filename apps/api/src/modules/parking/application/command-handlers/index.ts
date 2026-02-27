import { CreateParkingTypeCommandHandler } from './create-parking-type.command-handler';
import { UpdateParkingTypeCommandHandler } from './update-parking-type.command-handler';
import { DeleteParkingTypeCommandHandler } from './delete-parking-type.command-handler';

export const commandHandlers = [
  CreateParkingTypeCommandHandler,
  UpdateParkingTypeCommandHandler,
  DeleteParkingTypeCommandHandler,
];
