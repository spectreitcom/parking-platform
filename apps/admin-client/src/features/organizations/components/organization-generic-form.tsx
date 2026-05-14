import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { createOrganizationInputSchema } from '#/features/organizations/schemas';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import { DialogFooter } from '#/components/ui/dialog.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  createOrganization,
  updateOrganization,
} from '#/features/organizations/api';

type Props = Readonly<{
  organization?: OrganizationListItemSchema;
  onOpenChange: (open: boolean) => void;
}>;

export function OrganizationGenericForm({ organization, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const createOrganizationFn = useServerFn(createOrganization);
  const updateOrganizationFn = useServerFn(updateOrganization);

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      taxId: '',
    },
    validators: {
      onSubmit: createOrganizationInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);

        if (organization) {
          await updateOrganizationFn({
            data: {
              ...value,
              organizationId: organization.id,
              version: organization.version,
            },
          });
        } else {
          await createOrganizationFn({ data: value });
        }

        toast.success(
          organization
            ? 'Organization updated successfully'
            : 'Organization created successfully',
        );
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(
            `Failed to ${organization ? 'update' : 'create'} organization`,
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        address: organization.address,
        name: organization.name,
        taxId: organization.taxId,
      });
    }
  }, [organization, form]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter organization name"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <form.Field
        name="address"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Address</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter address"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <form.Field
        name="taxId"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Tax ID</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter tax ID"
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
          {isSubmitting || form.state.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
}
