export type OrganizationIntegrationEventTypes =
  | "organization.organization.created.v1"
  | "organization.organization.updated.v1";

export type OrganizationCreatedV1Payload = {
  organizationId: string;
  name: string;
  address: string;
  taxId: string;
};

export type OrganizationUpdatedV1Payload = {
  organizationId: string;
  name: string;
  address: string;
  taxId: string;
};
