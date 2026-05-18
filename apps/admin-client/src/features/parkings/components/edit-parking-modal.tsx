'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
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
import { Textarea } from '#/components/ui/textarea';
import { getOrganizationsList } from '#/features/organizations/api';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import { getPlacesList, updateParking } from '#/features/parkings/api';
import { updateParkingInputSchema } from '#/features/parkings/schemas';
import type {
  ParkingDetailsSchema,
  PlacesListItemSchema,
} from '#/features/parkings/schemas';
import { cn } from '#/lib/utils';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parking: ParkingDetailsSchema;
}>;

type SearchableOption = Readonly<{
  id: string;
  label: string;
  description?: string;
}>;

export function EditParkingModal({ open, onOpenChange, parking }: Props) {
  const router = useRouter();
  const updateParkingFn = useServerFn(updateParking);
  const getOrganizationsListFn = useServerFn(getOrganizationsList);
  const getPlacesListFn = useServerFn(getPlacesList);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<
    OrganizationListItemSchema[]
  >([]);
  const [places, setPlaces] = useState<PlacesListItemSchema[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<SearchableOption | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SearchableOption | null>(
    null,
  );
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState('');
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [organizationsError, setOrganizationsError] = useState<string | null>(
    null,
  );
  const [placesError, setPlacesError] = useState<string | null>(null);

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
    setOrganizationSearch('');
    setOrganizationSearchQuery('');
    setPlaceSearch('');
    setPlaceSearchQuery('');
    setOrganizations([]);
    setPlaces([]);
    setOrganizationsError(null);
    setPlacesError(null);
  };

  useEffect(() => {
    if (!open) return;
    form.reset(getParkingFormValues(parking));
    setSelectedOrganization(getParkingOrganizationOption(parking));
    setSelectedPlace(getParkingPlaceOption(parking));
  }, [form, open, parking]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setOrganizationSearchQuery(organizationSearch);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, organizationSearch]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setPlaceSearchQuery(placeSearch);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, placeSearch]);

  useEffect(() => {
    if (!open) return;

    let ignoreResponse = false;

    async function fetchOrganizations() {
      setIsLoadingOrganizations(true);
      setOrganizationsError(null);

      try {
        const fetchedOrganizations = await getOrganizationsListFn({
          data: {
            page: 1,
            limit: 20,
            search: organizationSearchQuery || undefined,
          },
        });

        if (!ignoreResponse) {
          setOrganizations(fetchedOrganizations.data);
        }
      } catch (error) {
        if (!ignoreResponse) {
          setOrganizations([]);
          setOrganizationsError(
            error instanceof Error
              ? error.message
              : 'Failed to load organizations',
          );
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    void fetchOrganizations();

    return () => {
      ignoreResponse = true;
    };
  }, [getOrganizationsListFn, open, organizationSearchQuery]);

  useEffect(() => {
    if (!open) return;

    let ignoreResponse = false;

    async function fetchPlaces() {
      setIsLoadingPlaces(true);
      setPlacesError(null);

      try {
        const fetchedPlaces = await getPlacesListFn({
          data: {
            page: 1,
            limit: 20,
            search: placeSearchQuery || undefined,
          },
        });

        if (!ignoreResponse) {
          setPlaces(fetchedPlaces.data);
        }
      } catch (error) {
        if (!ignoreResponse) {
          setPlaces([]);
          setPlacesError(
            error instanceof Error ? error.message : 'Failed to load places',
          );
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoadingPlaces(false);
        }
      }
    }

    void fetchPlaces();

    return () => {
      ignoreResponse = true;
    };
  }, [getPlacesListFn, open, placeSearchQuery]);

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
                    options={organizations.map((organization) => ({
                      id: organization.id,
                      label: organization.name,
                      description: organization.address,
                    }))}
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
                    options={places.map((place) => ({
                      id: place.id,
                      label: place.name,
                      description: place.address,
                    }))}
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

function SearchableDropdown({
  id,
  selectedOption,
  options,
  search,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  loadingLabel,
  isInvalid,
  isLoading,
  error,
  onSearchChange,
  onChange,
}: Readonly<{
  id: string;
  selectedOption: SearchableOption | null;
  options: SearchableOption[];
  search: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  loadingLabel: string;
  isInvalid: boolean;
  isLoading: boolean;
  error: string | null;
  onSearchChange: (search: string) => void;
  onChange: (option: SearchableOption) => void;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40',
          !selectedOption && 'text-muted-foreground',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={isInvalid}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md">
          <div className="relative mb-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder={searchPlaceholder}
              className="h-9 pl-9"
              autoFocus
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                {loadingLabel}
              </div>
            ) : error ? (
              <p className="px-2 py-2 text-sm text-destructive">{error}</p>
            ) : options.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </p>
            ) : (
              <ul role="listbox" aria-labelledby={id} className="space-y-1">
                {options.map((option) => {
                  const isSelected = selectedOption?.id === option.id;

                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className="flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          onChange(option);
                          setIsOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mt-0.5 size-4 shrink-0',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {option.label}
                          </span>
                          {option.description ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
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
