'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
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
import {
  getParkingFeatureById,
  updateParkingFeature,
} from '#/features/parkings/api';
import {
  parkingFeatureLevels,
  updateParkingFeatureInputSchema,
} from '#/features/parkings/schemas/parking-features.ts';
import type { ParkingFeaturesListItemSchema } from '#/features/parkings/schemas/parking-features.ts';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingFeatureId?: string;
}>;

export function EditParkingFeatureModal({
  open,
  onOpenChange,
  parkingFeatureId,
}: Props) {
  const updateParkingFeatureFn = useServerFn(updateParkingFeature);
  const getParkingFeatureByIdFn = useServerFn(getParkingFeatureById);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [parkingFeature, setParkingFeature] =
    useState<ParkingFeaturesListItemSchema | null>(null);

  const form = useForm({
    defaultValues: {
      name: parkingFeature?.name ?? '',
      levels:
        parkingFeature?.levels ??
        ([] as Array<(typeof parkingFeatureLevels)[number]>),
      version: parkingFeature?.version ?? 1,
      parkingFeatureId: parkingFeature?.id ?? '',
    },
    validators: {
      onSubmit: updateParkingFeatureInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await updateParkingFeatureFn({ data: value });
        toast.success('Parking feature updated successfully');
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to update parking feature');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const resetForm = () => {
    form.reset();
    setParkingFeature(null);
    setIsFetching(false);
  };

  useEffect(() => {
    if (parkingFeatureId && open) {
      getParkingFeatureByIdFn({ data: { parkingFeatureId } })
        .then((fetchedParkingFeature) => {
          setParkingFeature(fetchedParkingFeature);

          form.reset({
            name: fetchedParkingFeature.name,
            levels: fetchedParkingFeature.levels,
            version: fetchedParkingFeature.version,
            parkingFeatureId: fetchedParkingFeature.id,
          });
        })
        .catch((error) => {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to fetch parking feature');
          }
        })
        .finally(() => setIsFetching(false));
    }
  }, [parkingFeatureId, form, open, getParkingFeatureByIdFn]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Parking Feature</DialogTitle>
        </DialogHeader>

        {isFetching ? <Spinner /> : null}

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
                    placeholder="Enter parking feature name"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <form.Field
            name="levels"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Levels</FieldLabel>
                  <div className="grid gap-2" role="group" aria-label="Levels">
                    {parkingFeatureLevels.map((level) => {
                      const checked = field.state.value.includes(level);

                      return (
                        <label
                          key={level}
                          className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            name={field.name}
                            value={level}
                            checked={checked}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(
                                e.target.checked
                                  ? [...field.state.value, level]
                                  : field.state.value.filter(
                                      (selectedLevel) =>
                                        selectedLevel !== level,
                                    ),
                              );
                            }}
                            className="size-4 accent-primary"
                          />
                          {level}
                        </label>
                      );
                    })}
                  </div>
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
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
