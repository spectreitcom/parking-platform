import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx';
import { createPlaceInputSchema } from '#/features/parkings/schemas';
import type {
  GetPlaceForEditingResponseSchema,
  PlaceTypesListItemSchema,
} from '#/features/parkings/schemas';
import { DialogFooter } from '#/components/ui/dialog.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { createPlace, updatePlace } from '#/features/parkings/api';

type Props = Readonly<{
  placeTypes: Omit<PlaceTypesListItemSchema, 'version'>[];
  place?: GetPlaceForEditingResponseSchema;
  onOpenChange: (open: boolean) => void;
}>;

export function PlaceGenericForm({ placeTypes, place, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const createPlaceFn = useServerFn(createPlace);
  const updatePlaceFn = useServerFn(updatePlace);

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      placeTypeId: '',
    },
    validators: {
      onSubmit: createPlaceInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);

        if (place) {
          await updatePlaceFn({
            data: { ...value, placeId: place.placeId, version: place.version },
          });
        } else {
          await createPlaceFn({ data: value });
        }

        toast.success(
          place ? 'Place updated successfully' : 'Place created successfully',
        );
        onOpenChange(false);
        form.reset();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to ${place ? 'update' : 'create'} place`);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (place) {
      form.reset({
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        placeTypeId: place.placeTypeId,
      });
    }
  }, [place, form]);

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
                placeholder="Enter place name"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="latitude"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Latitude</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="52.2297"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="longitude"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Longitude</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  placeholder="21.0122"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </div>

      <form.Field
        name="placeTypeId"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Place Type</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
                disabled={placeTypes.length === 0}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                >
                  <SelectValue placeholder="Select place type" />
                </SelectTrigger>
                <SelectContent>
                  {placeTypes.map((placeType) => (
                    <SelectItem key={placeType.id} value={placeType.id}>
                      {placeType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          disabled={
            form.state.isSubmitting || placeTypes.length === 0 || isSubmitting
          }
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
