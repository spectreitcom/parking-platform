import { z } from 'zod';

export const organizationListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  address: z.string(),
  taxId: z.string(),
  version: z.number().int().positive(),
  members: z.array(
    z.object({
      id: z.uuid(),
      isRoot: z.boolean(),
      organizationUserId: z.uuid(),
      displayName: z.string(),
      email: z.string(),
    }),
  ),
});

export type OrganizationListItemSchema = z.infer<
  typeof organizationListItemSchema
>;

export const organizationListSchema = z.object({
  data: z.array(organizationListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const organizationsListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const createOrganizationInputSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  taxId: z.string().min(1).max(120),
});

export const updateOrganizationInputSchema =
  createOrganizationInputSchema.extend({
    version: z.number().int().positive(),
    organizationId: z.uuid(),
  });

export const addMemberToOrganizationInputSchema = z.object({
  organizationId: z.uuid(),
  organizationUserId: z.uuid(),
  isRoot: z.boolean(),
  version: z.number().int().positive(),
});

export const removeMemberFromOrganizationInputSchema = z.object({
  organizationId: z.uuid(),
  memberId: z.uuid(),
  version: z.number().int().positive(),
});

export const getOrganizationForEditingInputSchema = z.object({
  organizationId: z.uuid(),
});

export const searchedOrganizationUser = z.object({
  organizationUserId: z.uuid(),
  email: z.string(),
  displayName: z.string(),
});

export type SearchedOrganizationUser = z.infer<typeof searchedOrganizationUser>;

export const searchedOrganizationUsersResponseSchema = z.array(
  searchedOrganizationUser,
);

export const searchOrganizationUsersInputSchema = z.object({
  search: z.string().optional(),
});
