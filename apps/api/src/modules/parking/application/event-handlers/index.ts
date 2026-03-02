import { PlaceTypeDeletedEventHandler } from './place-type-deleted.event-handler';
import { ParkingAddonDeletedEventHandler } from './parking-addon-deleted.event-handler';
import { PlaceActivatedEventHandler } from './place-activated.event-handler';
import { ParkingAddonCreatedEventHandler } from './parking-addon-created.event-handler';
import { ParkingAddonUpdatedEventHandler } from './parking-addon-updated.event-handler';
import { PlaceCreatedEventHandler } from './place-created.event-handler';
import { PlaceDeactivatedEventHandler } from './place-deactivated.event-handler';
import { PlaceTypeCreatedEventHandler } from './place-type-created.event-handler';
import { PlaceTypeUpdatedEventHandler } from './place-type-updated.event-handler';
import { PlaceUpdatedEventHandler } from './place-updated.event-handler';

export const eventHandlers = [
  PlaceTypeDeletedEventHandler,
  ParkingAddonDeletedEventHandler,
  PlaceActivatedEventHandler,
  ParkingAddonCreatedEventHandler,
  ParkingAddonUpdatedEventHandler,
  PlaceCreatedEventHandler,
  PlaceDeactivatedEventHandler,
  PlaceTypeCreatedEventHandler,
  PlaceTypeUpdatedEventHandler,
  PlaceUpdatedEventHandler,
];
