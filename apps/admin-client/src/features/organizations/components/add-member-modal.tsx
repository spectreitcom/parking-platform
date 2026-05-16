import { useRouter } from '@tanstack/react-router';
import { addMemberToOrganizationInputSchema } from '#/features/organizations/schemas';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import type { OrganizationUserListItemSchema } from '#/features/organization-users/schemas';
import { useServerFn } from '@tanstack/react-start';
import { addMemberToOrganization } from '#/features/organizations/api';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx';
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx';
import { Switch } from '#/components/ui/switch.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';

export function AddMemberModal({
  open,
  onOpenChange,
  organization,
  organizationUsers,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationListItemSchema;
  organizationUsers: OrganizationUserListItemSchema[];
}>) {
  const router = useRouter();
  const addMemberToOrganizationFn = useServerFn(addMemberToOrganization);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      organizationUserId: '',
      isRoot: false,
    },
    validators: {
      onSubmit: addMemberToOrganizationInputSchema.omit({
        organizationId: true,
        version: true,
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await addMemberToOrganizationFn({
          data: {
            organizationId: organization.id,
            organizationUserId: value.organizationUserId,
            isRoot: value.isRoot,
            version: organization.version,
          },
        });
        toast.success('Member added successfully');
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to add member');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="organizationUserId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization User
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={organizationUsers.length === 0}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={isInvalid}
                    >
                      <SelectValue placeholder="Select organization user" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationUsers.map((organizationUser) => (
                        <SelectItem
                          key={organizationUser.organizationUserId}
                          value={organizationUser.organizationUserId}
                        >
                          {organizationUser.displayName} (
                          {organizationUser.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {organizationUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      All loaded organization users are already members.
                    </p>
                  ) : null}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="isRoot"
            children={(field) => (
              <Field className="flex flex-row items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor={field.name}>Root Member</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Grant elevated organization access.
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                form.state.isSubmitting ||
                organizationUsers.length === 0 ||
                isSubmitting
              }
            >
              {(form.state.isSubmitting || isSubmitting) && (
                <Spinner className="mr-2" />
              )}
              {form.state.isSubmitting || isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
