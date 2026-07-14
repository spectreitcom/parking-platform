export type PaymentIntegrationEventTypes = "payment.payment.expired.v1";

export type PaymentExpiredV1Payload = {
  paymentId: string;
  reservationId: string;
};
