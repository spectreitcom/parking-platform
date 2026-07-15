'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '#/components/ui/textarea';
import { updateParking } from '#/features/parkings/api';
import { useParkingFormOptions } from '#/features/parkings/hooks/use-parking-form-options';
import { updateParkingInputSchema } from '#/features/parkings/schemas';
import type { ParkingDetailsSchema } from '#/features/parkings/schemas';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parking: ParkingDetailsSchema;
}>;

export function EditParkingModal({ open, onOpenChange, parking }: Props) {
  const router = useRouter();
  const updateParkingFn = useServerFn(updateParking);
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
    defaultValues: getParkingFormValues(parking),
    validators: {
      onSubmit: updateParkingInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await updateParkingFn({ data: value });
        toast.success('Parking updated successfully');
        onOpenChange(false);
        resetForm();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to update parking');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const resetForm = () => {
    form.reset(getParkingFormValues(parking));
    setSelectedOrganization(getParkingOrganizationOption(parking));
    setSelectedPlace(getParkingPlaceOption(parking));
    resetOptions();
  };

  useEffect(() => {
    if (!open) return;
    form.reset(getParkingFormValues(parking));
    setSelectedOrganization(getParkingOrganizationOption(parking));
    setSelectedPlace(getParkingPlaceOption(parking));
  }, [form, open, parking]);

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
          <DialogTitle>Update Parking Details</DialogTitle>
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

          <form.Field
            name="statute"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Statute</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Enter parking statute"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="description"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Enter parking description"
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
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getParkingFormValues(parking: ParkingDetailsSchema) {
  return {
    name: parking.name,
    address: parking.address,
    latitude: parking.latitude,
    longitude: parking.longitude,
    organizationId: parking.organization.id,
    placeId: parking.place.id,
    assetIds: parking.assetIds,
    parkingFeatureIds: parking.parkingFeatures.map((feature) => feature.id),
    parkingAddonIds: parking.parkingAddons.map((addon) => addon.id),
    description: parking.description,
    statute: parking.statute,
    version: parking.version,
    parkingId: parking.id,
  };
}

function getParkingOrganizationOption(
  parking: ParkingDetailsSchema,
): SearchableOption {
  return {
    id: parking.organization.id,
    label: parking.organization.name,
  };
}

function getParkingPlaceOption(
  parking: ParkingDetailsSchema,
): SearchableOption {
  return {
    id: parking.place.id,
    label: parking.place.name,
  };
}
