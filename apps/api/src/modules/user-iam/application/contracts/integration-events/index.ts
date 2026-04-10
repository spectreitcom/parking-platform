export type UserIamIntegrationEventTypes =
  'user-iam.user.requested-reset-password.v1';

export type UserIamRequestedResetPasswordV1Payload = {
  email: string;
  name: string;
  userId: string;
};
