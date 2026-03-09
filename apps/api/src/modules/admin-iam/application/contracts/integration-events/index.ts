export type AdminIamIntegrationEventTypes =
  'admin-iam.admin-user.requested-reset-password.v1';

export type AdminIamRequestedResetPasswordV1Payload = {
  resetPasswordToken: string;
  email: string;
  displayName: string;
};
