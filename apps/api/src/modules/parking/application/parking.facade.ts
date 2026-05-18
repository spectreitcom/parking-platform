import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePlaceTypeCommand } from './commands/create-place-type.command';
import { UpdatePlaceTypeCommand } from './commands/update-place-type.command';
import { DeletePlaceTypeCommand } from './commands/delete-place-type.command';
import { CreateParkingAddonCommand } from './commands/create-parking-addon.command';
import { UpdateParkingAddonCommand } from './commands/update-parking-addon.command';
import { DeleteParkingAddonCommand } from './commands/delete-parking-addon.command';
import { CreatePlaceCommand } from './commands/create-place.command';
import { UpdatePlaceCommand } from './commands/update-place.command';
import { ActivatePlaceCommand } from './commands/activate-place.command';
import { DeactivatePlaceCommand } from './commands/deactivate-place.command';
import { CreateParkingFeatureCommand } from './commands/create-parking-feature.command';
import { UpdateParkingFeatureCommand } from './commands/update-parking-feature.command';
import { DeleteParkingFeatureCommand } from './commands/delete-parking-feature.command';
import { CreateParkingCommand } from './commands/create-parking.command';
import { UpdateParkingCommand } from './commands/update-parking.command';
import { ActivateParkingCommand } from './commands/activate-parking.command';
import { DeactivateParkingCommand } from './commands/deactivate-parking.command';
import { CreateParkingSpotCommand } from './commands/create-parking-spot.command';
import { UpdateParkingSpotCommand } from './commands/update-parking-spot.command';
import { ActivateParkingSpotCommand } from './commands/activate-parking-spot.command';
import { DeactivateParkingSpotCommand } from './commands/deactivate-parking-spot.command';
import { GetPlacesListForAdminQuery } from './queries/get-places-list-for-admin.query';
import { PlaceListForAdminItemReadModel } from './query-handlers/read-models/place-list-for-admin-item.read-model';
import { GetPlacesListForAdminTotalQuery } from './queries/get-places-list-for-admin-total.query';
import { GetParkingListForAdminQuery } from './queries/get-parking-list-for-admin.query';
import { ParkingListForAdminItemReadModel } from './query-handlers/read-models/parking-list-for-admin-item.read-model';
import { GetParkingListForAdminTotalQuery } from './queries/get-parking-list-for-admin-total.query';
import { GetParkingAddonListForAdminQuery } from './queries/get-parking-addon-list-for-admin.query';
import { ParkingAddonListForAdminItemReadModel } from './query-handlers/read-models/parking-addon-list-for-admin-item.read-model';
import { GetParkingAddonListForAdminTotalQuery } from './queries/get-parking-addon-list-for-admin-total.query';
import { GetParkingFeatureListForAdminQuery } from './queries/get-parking-feature-list-for-admin.query';
import { ParkingFeatureItemReadModel } from './query-handlers/read-models/parking-feature-item.read-model';
import { GetParkingFeatureListForAdminTotalQuery } from './queries/get-parking-feature-list-for-admin-total.query';
import { GetPlaceTypeListQuery } from './queries/get-place-type-list.query';
import { PlaceTypeListItemReadModel } from './query-handlers/read-models/place-type-list-item.read-model';
import { GetPlaceTypeListTotalQuery } from './queries/get-place-type-list-total.query';
import { GetParkingByIdsQuery } from './queries/get-parking-by-ids.query';
import { ParkingItemReadModel } from './query-handlers/read-models/parking-item.read-model';
import { GetParkingByParkingSpotIdQuery } from './queries/get-parking-by-parking-spot-id.query';
import { GetParkingFeatureByIdQuery } from './queries/get-parking-feature-by-id.query';
import { GetParkingAddonByIdsQuery } from './queries/get-parking-addon-by-ids.query';
import { ParkingAddonReadModel } from './query-handlers/read-models/parking-addon.read-model';
import { GetParkingFeatureByIdsQuery } from './queries/get-parking-feature-by-ids.query';
import { ParkingFeatureReadModel } from './query-handlers/read-models/parking-feature.read-model';
import { GetPlaceForEditingQuery } from 'src/modules/parking/application/queries/get-place-for-editing.query';
import { PlaceReadReadModel } from './query-handlers/read-models/place-read.read-model';
import { GetParkingByIdQuery } from './queries/get-parking-by-id.query';

@Injectable()
export class ParkingFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createPlaceType(name: string) {
    const command = new CreatePlaceTypeCommand(name);
    return await this.commandBus.execute<CreatePlaceTypeCommand, string>(
      command,
    );
  }

  async updatePlaceType(id: string, name: string, version: number) {
    const command = new UpdatePlaceTypeCommand(id, name, version);
    return await this.commandBus.execute<UpdatePlaceTypeCommand, string>(
      command,
    );
  }

  async deletePlaceType(id: string, version: number) {
    const command = new DeletePlaceTypeCommand(id, version);
    return await this.commandBus.execute<DeletePlaceTypeCommand, string>(
      command,
    );
  }

  async createParkingAddon(code: string, name: string, price: number) {
    const command = new CreateParkingAddonCommand(code, name, price);
    return await this.commandBus.execute<CreateParkingAddonCommand, string>(
      command,
    );
  }

  async deleteParkingAddon(id: string, version: number) {
    const command = new DeleteParkingAddonCommand(id, version);
    return await this.commandBus.execute<DeleteParkingAddonCommand, string>(
      command,
    );
  }

  async updateParkingAddon(
    id: string,
    name: string,
    price: number,
    version: number,
  ) {
    const command = new UpdateParkingAddonCommand(id, name, price, version);
    return await this.commandBus.execute<UpdateParkingAddonCommand, string>(
      command,
    );
  }

  async createPlace(
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    address: string,
  ) {
    const command = new CreatePlaceCommand(
      name,
      latitude,
      longitude,
      placeTypeId,
      address,
    );
    return await this.commandBus.execute<CreatePlaceCommand, string>(command);
  }

  async updatePlace(
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    address: string,
    version: number,
  ) {
    const command = new UpdatePlaceCommand(
      id,
      name,
      latitude,
      longitude,
      placeTypeId,
      address,
      version,
    );
    return await this.commandBus.execute<UpdatePlaceCommand, string>(command);
  }

  async activatePlace(id: string, version: number) {
    const command = new ActivatePlaceCommand(id, version);
    return await this.commandBus.execute<ActivatePlaceCommand, string>(command);
  }

  async deactivatePlace(id: string, version: number) {
    const command = new DeactivatePlaceCommand(id, version);
    return await this.commandBus.execute<DeactivatePlaceCommand, string>(
      command,
    );
  }

  async createParkingFeature(name: string, levels: string[]) {
    const command = new CreateParkingFeatureCommand(name, levels);
    return await this.commandBus.execute<CreateParkingFeatureCommand, string>(
      command,
    );
  }

  async updateParkingFeature(
    id: string,
    name: string,
    levels: string[],
    version: number,
  ) {
    const command = new UpdateParkingFeatureCommand(id, name, levels, version);
    return await this.commandBus.execute<UpdateParkingFeatureCommand, string>(
      command,
    );
  }

  async deleteParkingFeature(id: string, version: number) {
    const command = new DeleteParkingFeatureCommand(id, version);
    return await this.commandBus.execute<DeleteParkingFeatureCommand, string>(
      command,
    );
  }

  async createParking(
    organizationId: string,
    name: string,
    address: string,
    longitude: number,
    latitude: number,
    placeId: string,
  ) {
    const command = new CreateParkingCommand(
      organizationId,
      name,
      address,
      longitude,
      latitude,
      placeId,
    );
    return await this.commandBus.execute<CreateParkingCommand, string>(command);
  }

  async updateParking(
    id: string,
    name: string,
    address: string,
    longitude: number,
    latitude: number,
    assetIds: string[],
    parkingFeatureIds: string[],
    parkingAddonIds: string[],
    description: string,
    statute: string,
    version: number,
    placeId: string,
    organizationId: string,
  ) {
    const command = new UpdateParkingCommand(
      id,
      name,
      address,
      longitude,
      latitude,
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      description,
      statute,
      version,
      placeId,
      organizationId,
    );
    return await this.commandBus.execute<UpdateParkingCommand, string>(command);
  }

  async activateParking(id: string, version: number) {
    const command = new ActivateParkingCommand(id, version);
    return await this.commandBus.execute<ActivateParkingCommand, string>(
      command,
    );
  }

  async deactivateParking(id: string, version: number) {
    const command = new DeactivateParkingCommand(id, version);
    return await this.commandBus.execute<DeactivateParkingCommand, string>(
      command,
    );
  }

  async createParkingSpot(
    parkingId: string,
    price: number,
    parkingSpotFeatureIds: string[],
    organizationId: string,
  ) {
    const command = new CreateParkingSpotCommand(
      parkingId,
      price,
      parkingSpotFeatureIds,
      organizationId,
    );
    return await this.commandBus.execute<CreateParkingSpotCommand, string>(
      command,
    );
  }

  async updateParkingSpot(
    id: string,
    price: number,
    parkingSpotFeatureIds: string[],
    version: number,
    organizationId: string,
  ) {
    const command = new UpdateParkingSpotCommand(
      id,
      price,
      parkingSpotFeatureIds,
      version,
      organizationId,
    );
    return await this.commandBus.execute<UpdateParkingSpotCommand, string>(
      command,
    );
  }

  async activateParkingSpot(
    id: string,
    version: number,
    organizationId: string,
  ) {
    const command = new ActivateParkingSpotCommand(id, version, organizationId);
    return await this.commandBus.execute<ActivateParkingSpotCommand, string>(
      command,
    );
  }

  async deactivateParkingSpot(
    id: string,
    version: number,
    organizationId: string,
  ) {
    const command = new DeactivateParkingSpotCommand(
      id,
      version,
      organizationId,
    );
    return await this.commandBus.execute<DeactivateParkingSpotCommand, string>(
      command,
    );
  }

  async getPlacesListForAdmin(page: number, limit: number, search?: string) {
    const query = new GetPlacesListForAdminQuery(page, limit, search);
    return await this.queryBus.execute<
      GetPlacesListForAdminQuery,
      PlaceListForAdminItemReadModel[]
    >(query);
  }

  async getPlacesListForAdminTotal(search?: string) {
    return await this.queryBus.execute<GetPlacesListForAdminTotalQuery, number>(
      new GetPlacesListForAdminTotalQuery(search),
    );
  }

  async getParkingListForAdmin(page: number, limit: number, search?: string) {
    const query = new GetParkingListForAdminQuery(page, limit, search);
    return await this.queryBus.execute<
      GetParkingListForAdminQuery,
      ParkingListForAdminItemReadModel[]
    >(query);
  }

  async getParkingListForAdminTotal(search?: string) {
    const query = new GetParkingListForAdminTotalQuery(search);
    return await this.queryBus.execute<
      GetParkingListForAdminTotalQuery,
      number
    >(query);
  }

  async getParkingAddonListForAdmin(
    page: number,
    limit: number,
    search?: string,
  ) {
    const query = new GetParkingAddonListForAdminQuery(page, limit, search);
    return await this.queryBus.execute<
      GetParkingAddonListForAdminQuery,
      ParkingAddonListForAdminItemReadModel[]
    >(query);
  }

  async getParkingAddonListForAdminTotal(search?: string) {
    const query = new GetParkingAddonListForAdminTotalQuery(search);
    return await this.queryBus.execute<
      GetParkingAddonListForAdminTotalQuery,
      number
    >(query);
  }

  async getParkingFeatureListForAdmin(
    page: number,
    limit: number,
    search?: string,
  ) {
    const query = new GetParkingFeatureListForAdminQuery(page, limit, search);
    return await this.queryBus.execute<
      GetParkingFeatureListForAdminQuery,
      ParkingFeatureItemReadModel[]
    >(query);
  }

  async getParkingFeatureListForAdminTotal(search?: string) {
    const query = new GetParkingFeatureListForAdminTotalQuery(search);
    return await this.queryBus.execute<
      GetParkingFeatureListForAdminTotalQuery,
      number
    >(query);
  }

  async getPlaceTypeList(page: number, limit: number, search?: string) {
    const query = new GetPlaceTypeListQuery(page, limit, search);
    return await this.queryBus.execute<
      GetPlaceTypeListQuery,
      PlaceTypeListItemReadModel[]
    >(query);
  }

  async getPlaceTypeListTotal(search?: string) {
    const query = new GetPlaceTypeListTotalQuery(search);
    return await this.queryBus.execute<GetPlaceTypeListTotalQuery, number>(
      query,
    );
  }

  async getParkingByIds(ids: string[]) {
    const query = new GetParkingByIdsQuery(ids);
    return await this.queryBus.execute<
      GetParkingByIdsQuery,
      ParkingItemReadModel[]
    >(query);
  }

  async getParkingByParkingSpotId(parkingSpotId: string) {
    const query = new GetParkingByParkingSpotIdQuery(parkingSpotId);
    return await this.queryBus.execute<
      GetParkingByParkingSpotIdQuery,
      ParkingItemReadModel | null
    >(query);
  }

  async getPlaceForEditing(placeId: string) {
    const query = new GetPlaceForEditingQuery(placeId);
    return await this.queryBus.execute<
      GetPlaceForEditingQuery,
      PlaceReadReadModel
    >(query);
  }

  async getParkingFeatureById(id: string) {
    const query = new GetParkingFeatureByIdQuery(id);
    return await this.queryBus.execute<
      GetParkingFeatureByIdQuery,
      ParkingFeatureItemReadModel
    >(query);
  }

  async getParkingById(id: string) {
    const query = new GetParkingByIdQuery(id);
    return await this.queryBus.execute<
      GetParkingByIdQuery,
      ParkingItemReadModel
    >(query);
  }

  async getParkingAddonByIds(ids: string[]) {
    const query = new GetParkingAddonByIdsQuery(ids);
    return await this.queryBus.execute<
      GetParkingAddonByIdsQuery,
      ParkingAddonReadModel[]
    >(query);
  }

  async getParkingFeatureByIds(ids: string[]) {
    const query = new GetParkingFeatureByIdsQuery(ids);
    return await this.queryBus.execute<
      GetParkingFeatureByIdsQuery,
      ParkingFeatureReadModel[]
    >(query);
  }
}
