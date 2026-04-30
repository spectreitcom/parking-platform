export type AdminIamIntegrationEventTypes =
  | "admin-iam.admin-user.requested-reset-password.v1"
  | "admin-iam.admin-user.invited.v1";

export type AdminIamRequestedResetPasswordV1Payload = {
  email: string;
  displayName: string;
  adminUserId: string;
};

export type AdminIamAdminUserInvitedV1Payload = {
  email: string;
  displayName: string;
  adminUserId: string;
};
