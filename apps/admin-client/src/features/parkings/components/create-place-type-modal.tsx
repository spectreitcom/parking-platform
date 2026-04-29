'use client';

import * as React from 'react';
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
import { createPlaceType } from '#/features/parkings/api';
import { createPlaceTypeInputSchema } from '#/features/parkings/schemas';
import { Spinner } from '#/components/ui/spinner';
import { useRouter } from '@tanstack/react-router';

interface CreatePlaceTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlaceTypeModal({
  open,
  onOpenChange,
}: CreatePlaceTypeModalProps) {
  const createPlaceTypeFn = useServerFn(createPlaceType);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: createPlaceTypeInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createPlaceTypeFn({ data: value });
        toast.success('Place type created successfully');
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        toast.error('Failed to create place type');
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Place Type</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting && <Spinner className="mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
