export type UserIamIntegrationEventTypes =
  | "user-iam.user.requested-reset-password.v1"
  | "user-iam.user.created.v1";

export type UserIamRequestedResetPasswordV1Payload = {
  email: string;
  name: string;
  userId: string;
};

export type UserIamUserCreatedV1Payload = {
  email: string;
  name: string;
  userId: string;
};
