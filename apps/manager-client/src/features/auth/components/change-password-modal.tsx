'use client';

import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { changePassword } from '#/features/auth/api';
import { changePasswordFormSchema } from '#/features/auth/schemas';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function ChangePasswordModal({ open, onOpenChange }: Props) {
  const changePasswordFn = useServerFn(changePassword);

  const form = useForm({
    defaultValues: {
      existingPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onSubmit: changePasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await changePasswordFn({
          data: {
            existingPassword: value.existingPassword,
            newPassword: value.newPassword,
          },
        });
        toast.success('Password changed successfully');
        form.reset();
        onOpenChange(false);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to change password');
        }
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
          <div className="mb-1 flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
            <KeyRound className="size-5" />
          </div>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <form.Field
            name="existingPassword"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="current-password"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="newPassword"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="confirmNewPassword"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={isInvalid}
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
                form.reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting && <Spinner className="mr-2" />}
              Change Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
