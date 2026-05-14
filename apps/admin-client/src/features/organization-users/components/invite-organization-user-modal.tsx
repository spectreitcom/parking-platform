'use client';

import { useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import { Button } from '#/components/ui/button';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { inviteOrganizationUser } from '#/features/organization-users/api';
import { inviteOrganizationUserInputSchema } from '#/features/organization-users/schemas';
import { useState } from 'react';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function InviteOrganizationUserModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const inviteOrganizationUserFn = useServerFn(inviteOrganizationUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      displayName: '',
    },
    validators: {
      onSubmit: inviteOrganizationUserInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await inviteOrganizationUserFn({ data: value });
        toast.success('Organization user invited successfully');
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to invite organization user');
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
          <DialogTitle>Invite Organization User</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="displayName"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter display name"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter email address"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
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
              disabled={form.state.isSubmitting || isSubmitting}
            >
              {(form.state.isSubmitting || isSubmitting) && (
                <Spinner className="mr-2" />
              )}
              {form.state.isSubmitting || isSubmitting
                ? 'Inviting...'
                : 'Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
