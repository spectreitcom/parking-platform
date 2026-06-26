import { ParkingCreatedIeHandler } from './parking-created.ie-handler';
import { ParkingUpdatedIeHandler } from './parking-updated.ie-handler';
import { ParkingActivatedIeHandler } from './parking-activated.ie-handler';
import { ParkingDeactivatedIeHandler } from './parking-deactivated.ie-handler';
import { ParkingSpotCreatedIeHandler } from './parking-spot-created.ie-handler';
import { ParkingSpotUpdatedIeHandler } from './parking-spot-updated.ie-handler';

export const ieHandlers = [
  ParkingCreatedIeHandler,
  ParkingUpdatedIeHandler,
  ParkingActivatedIeHandler,
  ParkingDeactivatedIeHandler,
  ParkingSpotCreatedIeHandler,
  ParkingSpotUpdatedIeHandler,
];
