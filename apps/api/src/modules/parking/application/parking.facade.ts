import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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

@Injectable()
export class ParkingFacade {
  constructor(private readonly commandBus: CommandBus) {}

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
    active: boolean,
    address: string,
  ) {
    const command = new CreatePlaceCommand(
      name,
      latitude,
      longitude,
      placeTypeId,
      active,
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
    ownerId: string,
    name: string,
    address: string,
    longitude: number,
    latitude: number,
    placeId: string,
  ) {
    const command = new CreateParkingCommand(
      ownerId,
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
    parkingOwnerId: string,
  ) {
    const command = new CreateParkingSpotCommand(
      parkingId,
      price,
      parkingSpotFeatureIds,
      parkingOwnerId,
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
    parkingOwnerId: string,
  ) {
    const command = new UpdateParkingSpotCommand(
      id,
      price,
      parkingSpotFeatureIds,
      version,
      parkingOwnerId,
    );
    return await this.commandBus.execute<UpdateParkingSpotCommand, string>(
      command,
    );
  }

  async activateParkingSpot(
    id: string,
    version: number,
    parkingOwnerId: string,
  ) {
    const command = new ActivateParkingSpotCommand(id, version, parkingOwnerId);
    return await this.commandBus.execute<ActivateParkingSpotCommand, string>(
      command,
    );
  }

  async deactivateParkingSpot(
    id: string,
    version: number,
    parkingOwnerId: string,
  ) {
    const command = new DeactivateParkingSpotCommand(
      id,
      version,
      parkingOwnerId,
    );
    return await this.commandBus.execute<DeactivateParkingSpotCommand, string>(
      command,
    );
  }
}
