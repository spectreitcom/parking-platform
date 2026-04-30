export type OrganizationUserIamIntegrationEventTypes =
  | "organization-user-iam.organization-user.created.v1"
  | "organization-user-iam.organization-user.invited.v1"
  | "organization-user-iam.organization-user.updated.v1"
  | "organization-user-iam.organization-user.requested-reset-password.v1";

export type OrganizationUserIamCreatedV1Payload = {
  organizationUserId: string;
  email: string;
  displayName: string;
};

export type OrganizationUserIamUpdatedV1Payload = {
  organizationUserId: string;
  email: string;
  displayName: string;
};

export type OrganizationUserIamOrganizationUserInvitedV1Payload = {
  email: string;
  displayName: string;
  organizationUserId: string;
};

export type OrganizationUserIamRequestedResetPasswordV1Payload = {
  organizationUserId: string;
  email: string;
  displayName: string;
};
