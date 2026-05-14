import { z } from 'zod';

export const organizationUserListItemSchema = z.object({
  organizationUserId: z.uuid(),
  email: z.email(),
  displayName: z.string(),
  statusText: z.string(),
});

export type OrganizationUserListItemSchema = z.infer<
  typeof organizationUserListItemSchema
>;

export const organizationUserListSchema = z.object({
  data: z.array(organizationUserListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const organizationUsersListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const getOrganizationUserByIdInputSchema = z.object({
  organizationUserId: z.uuid(),
});

export const inviteOrganizationUserInputSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1).max(120),
});
