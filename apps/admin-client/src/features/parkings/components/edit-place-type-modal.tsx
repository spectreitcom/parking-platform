'use client';

import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Field, FieldLabel, FieldError } from '#/components/ui/field';
import { updatePlaceType } from '#/features/parkings/api';
import { updatePlaceTypeInputSchema } from '#/features/parkings/schemas';
import { Spinner } from '#/components/ui/spinner';
import { useRouter } from '@tanstack/react-router';
import type { PlaceTypesListItemSchema } from '#/features/parkings/schemas';
import { useEffect } from 'react';

interface EditPlaceTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeType: PlaceTypesListItemSchema | null;
}

export function EditPlaceTypeModal({
  open,
  onOpenChange,
  placeType,
}: EditPlaceTypeModalProps) {
  const updatePlaceTypeFn = useServerFn(updatePlaceType);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: placeType?.name ?? '',
      version: placeType?.version ?? 1,
      placeTypeId: placeType?.id ?? '',
    },
    validators: {
      onSubmit: updatePlaceTypeInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updatePlaceTypeFn({ data: value });
        toast.success('Place type updated successfully');
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to update place type');
        }
      }
    },
  });

  // Update form values when placeType changes or modal opens
  useEffect(() => {
    if (placeType && open) {
      form.setFieldValue('name', placeType.name);
      form.setFieldValue('version', placeType.version);
      form.setFieldValue('placeTypeId', placeType.id);
    }
  }, [placeType, form, open]);

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
          <DialogTitle>Edit Place Type</DialogTitle>
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
                    placeholder="Enter place type name"
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
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting && <Spinner className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
