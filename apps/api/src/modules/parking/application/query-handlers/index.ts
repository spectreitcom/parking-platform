import { GetPlacesListForAdminQueryHandler } from './get-places-list-for-admin.query-handler';
import { GetPlacesListForAdminTotalQueryHandler } from './get-places-list-for-admin-total.query-handler';
import { GetParkingListForAdminQueryHandler } from './get-parking-list-for-admin.query-handler';
import { GetParkingListForAdminTotalQueryHandler } from './get-parking-list-for-admin-total.query-handler';
import { GetParkingAddonListForAdminQueryHandler } from './get-parking-addon-list-for-admin.query-handler';
import { GetParkingAddonListForAdminTotalQueryHandler } from './get-parking-addon-list-for-admin-total.query-handler';
import { GetParkingFeatureListForAdminQueryHandler } from './get-parking-feature-list-for-admin.query-handler';
import { GetParkingFeatureListForAdminTotalQueryHandler } from './get-parking-feature-list-for-admin-total.query-handler';
import { GetPlaceTypeListQueryHandler } from './get-place-type-list.query-handler';
import { GetPlaceTypeListTotalQueryHandler } from './get-place-type-list-total.query-handler';
import { GetParkingByIdsQueryHandler } from './get-parking-by-ids.query-handler';
import { GetParkingByParkingSpotIdQueryHandler } from './get-parking-by-parking-spot-id.query-handler';

export const queryHandlers = [
  GetPlacesListForAdminQueryHandler,
  GetPlacesListForAdminTotalQueryHandler,
  GetParkingListForAdminQueryHandler,
  GetParkingListForAdminTotalQueryHandler,
  GetParkingAddonListForAdminQueryHandler,
  GetParkingAddonListForAdminTotalQueryHandler,
  GetParkingFeatureListForAdminQueryHandler,
  GetParkingFeatureListForAdminTotalQueryHandler,
  GetPlaceTypeListQueryHandler,
  GetPlaceTypeListTotalQueryHandler,
  GetParkingByIdsQueryHandler,
  GetParkingByParkingSpotIdQueryHandler,
];
