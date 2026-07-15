'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { SearchableDropdown } from '#/components/searchable-dropdown';
import type { SearchableOption } from '#/components/searchable-dropdown';
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
import { createParking } from '#/features/parkings/api';
import { useParkingFormOptions } from '#/features/parkings/hooks/use-parking-form-options';
import { createParkingInputSchema } from '#/features/parkings/schemas';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function CreateParkingModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const createParkingFn = useServerFn(createParking);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<SearchableOption | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SearchableOption | null>(
    null,
  );
  const {
    organizations: {
      options: organizations,
      search: organizationSearch,
      setSearch: setOrganizationSearch,
      isLoading: isLoadingOrganizations,
      error: organizationsError,
    },
    places: {
      options: places,
      search: placeSearch,
      setSearch: setPlaceSearch,
      isLoading: isLoadingPlaces,
      error: placesError,
    },
    reset: resetOptions,
  } = useParkingFormOptions(open);

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      organizationId: '',
      placeId: '',
    },
    validators: {
      onSubmit: createParkingInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await createParkingFn({ data: value });
        toast.success('Parking created successfully');
        onOpenChange(false);
        resetForm();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to create parking');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const resetForm = () => {
    form.reset();
    setSelectedOrganization(null);
    setSelectedPlace(null);
    resetOptions();
  };

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
          <DialogTitle>Create Parking</DialogTitle>
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
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Enter parking name"
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
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Enter parking address"
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
                      step="any"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.valueAsNumber)
                      }
                      placeholder="52.2297"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                      step="any"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.valueAsNumber)
                      }
                      placeholder="21.0122"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </div>

          <form.Field
            name="organizationId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Organization</FieldLabel>
                  <SearchableDropdown
                    id={field.name}
                    selectedOption={selectedOrganization}
                    options={organizations}
                    search={organizationSearch}
                    placeholder="Select organization"
                    searchPlaceholder="Search organizations..."
                    emptyLabel="No organizations found."
                    loadingLabel="Searching organizations..."
                    isInvalid={isInvalid}
                    isLoading={isLoadingOrganizations}
                    error={organizationsError}
                    onSearchChange={setOrganizationSearch}
                    onChange={(option) => {
                      setSelectedOrganization(option);
                      field.handleChange(option.id);
                    }}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="placeId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Place</FieldLabel>
                  <SearchableDropdown
                    id={field.name}
                    selectedOption={selectedPlace}
                    options={places}
                    search={placeSearch}
                    placeholder="Select place"
                    searchPlaceholder="Search places..."
                    emptyLabel="No places found."
                    loadingLabel="Searching places..."
                    isInvalid={isInvalid}
                    isLoading={isLoadingPlaces}
                    error={placesError}
                    onSearchChange={setPlaceSearch}
                    onChange={(option) => {
                      setSelectedPlace(option);
                      field.handleChange(option.id);
                    }}
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
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                form.state.isSubmitting ||
                !selectedOrganization ||
                !selectedPlace ||
                isSubmitting
              }
            >
              {(form.state.isSubmitting || isSubmitting) && (
                <Spinner className="mr-2" />
              )}
              {form.state.isSubmitting || isSubmitting
                ? 'Creating...'
                : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
