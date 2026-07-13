export type ReservationIntegrationEventTypes =
  | "reservation.reservation.created.v1"
  | "reservation.reservation.cancelled.v1"
  | "reservation.reservation.completed.v1";

export type ReservationCreatedV1Payload = {
  reservationId: string;
  parkingSpotId: string;
};

export type ReservationCancelledV1Payload = {
  reservationId: string;
  parkingSpotId: string;
};

export type ReservationCompletedV1Payload = {
  reservationId: string;
  parkingSpotId: string;
};
