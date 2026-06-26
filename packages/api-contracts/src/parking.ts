export type ParkingIntegrationEventTypes =
  | "parking.parking.created.v1"
  | "parking.parking.updated.v1"
  | "parking.parking.activated.v1"
  | "parking.parking.deactivated.v1"
  | "parking.parking-spot.created.v1"
  | "parking.parking-spot.updated.v1"
  | "parking.parking-spot.activated.v1"
  | "parking.parking-spot.deactivated.v1";

export type ParkingCreatedV1Payload = {
  parkingId: string;
  name: string;
  longitude: number;
  latitude: number;
  placeId: string;
  active: boolean;
  distance: number;
};

export type ParkingUpdatedV1Payload = {
  parkingId: string;
  name: string;
  longitude: number;
  latitude: number;
  placeId: string;
  active: boolean;
  distance: number;
  assetIds: string[];
  featureIds: string[];
  features: { name: string }[];
};

export type ParkingActivatedV1Payload = {
  parkingId: string;
};

export type ParkingDeactivatedV1Payload = {
  parkingId: string;
};

export type ParkingSpotCreatedV1Payload = {
  parkingSpotId: string;
  parkingId: string;
  price: number;
  pricePLN: number;
  featureIds: string[];
  features: { name: string }[];
  active: boolean;
};

export type ParkingSpotUpdatedV1Payload = {
  parkingSpotId: string;
  parkingId: string;
  price: number;
  pricePLN: number;
  featureIds: string[];
  features: { name: string }[];
  active: boolean;
};

// export type ParkingSpotActivatedV1Payload = {
//   parkingSpotId: string;
//   parkingId: string;
// };

// export type ParkingSpotDeactivatedV1Payload = {
//   parkingSpotId: string;
//   parkingId: string;
// };
