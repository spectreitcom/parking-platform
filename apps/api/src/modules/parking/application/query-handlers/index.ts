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
import { GetPlaceForEditingQueryHandler } from './get-place-for-editing.query-handler';
import { GetParkingFeatureByIdQueryHandler } from './get-parking-feature-by-id.query-handler';
import { GetParkingByIdQueryHandler } from './get-parking-by-id.query-handler';
import { GetParkingAddonByIdsQueryHandler } from './get-parking-addon-by-ids.query-handler';
import { GetParkingFeatureByIdsQueryHandler } from './get-parking-feature-by-ids.query-handler';
import { GetParkingsByOrganizationAndOrganizationUserForManagerQueryHandler } from './get-parkings-by-organization-and-organization-user-for-manager.query-handler';
import { GetParkingsByOrganizationAndOrganizationUserForManagerTotalQueryHandler } from './get-parkings-by-organization-and-organization-user-for-manager-total.query-handler';
import { GetPlaceByIdsQueryHandler } from './get-place-by-ids.query-handler';

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
  GetPlaceForEditingQueryHandler,
  GetParkingFeatureByIdQueryHandler,
  GetParkingByIdQueryHandler,
  GetParkingAddonByIdsQueryHandler,
  GetParkingFeatureByIdsQueryHandler,
  GetParkingsByOrganizationAndOrganizationUserForManagerQueryHandler,
  GetParkingsByOrganizationAndOrganizationUserForManagerTotalQueryHandler,
  GetPlaceByIdsQueryHandler,
];
