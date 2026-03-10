import { GetPlacesListForAdminQueryHandler } from './get-places-list-for-admin.query-handler';
import { GetPlacesListForAdminTotalQueryHandler } from './get-places-list-for-admin-total.query-handler';
import { GetParkingListForAdminQueryHandler } from './get-parking-list-for-admin.query-handler';
import { GetParkingListForAdminTotalQueryHandler } from './get-parking-list-for-admin-total.query-handler';

export const queryHandlers = [
  GetPlacesListForAdminQueryHandler,
  GetPlacesListForAdminTotalQueryHandler,
  GetParkingListForAdminQueryHandler,
  GetParkingListForAdminTotalQueryHandler,
];
