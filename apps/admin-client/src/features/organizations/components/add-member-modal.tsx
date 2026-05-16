import { useRouter } from '@tanstack/react-router';
import { addMemberToOrganizationInputSchema } from '#/features/organizations/schemas';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import type { OrganizationUserListItemSchema } from '#/features/organization-users/schemas';
import { useServerFn } from '@tanstack/react-start';
import { addMemberToOrganization } from '#/features/organizations/api';
import { getOrganizationUsers } from '#/features/organization-users/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx';
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Switch } from '#/components/ui/switch.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '#/lib/utils.ts';

export function AddMemberModal({
  open,
  onOpenChange,
  organization,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationListItemSchema;
}>) {
  const router = useRouter();
  const addMemberToOrganizationFn = useServerFn(addMemberToOrganization);
  const getOrganizationUsersFn = useServerFn(getOrganizationUsers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState<
    OrganizationUserListItemSchema[]
  >([]);
  const [selectedOrganizationUser, setSelectedOrganizationUser] =
    useState<OrganizationUserListItemSchema | null>(null);
  const [organizationUserSearch, setOrganizationUserSearch] = useState('');
  const [organizationUserSearchQuery, setOrganizationUserSearchQuery] =
    useState('');
  const [isLoadingOrganizationUsers, setIsLoadingOrganizationUsers] =
    useState(false);
  const [organizationUsersError, setOrganizationUsersError] = useState<
    string | null
  >(null);
  const assignedOrganizationUserIds = useMemo(
    () =>
      new Set(organization.members.map((member) => member.organizationUserId)),
    [organization.members],
  );
  const availableOrganizationUsers = useMemo(
    () =>
      organizationUsers.filter(
        (organizationUser) =>
          !assignedOrganizationUserIds.has(organizationUser.organizationUserId),
      ),
    [assignedOrganizationUserIds, organizationUsers],
  );

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setOrganizationUserSearchQuery(organizationUserSearch);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, organizationUserSearch]);

  useEffect(() => {
    if (!open) return;

    let ignoreResponse = false;

    async function fetchOrganizationUsers() {
      setIsLoadingOrganizationUsers(true);
      setOrganizationUsersError(null);

      try {
        const response = await getOrganizationUsersFn({
          data: {
            page: 1,
            limit: 20,
            search: organizationUserSearchQuery || undefined,
          },
        });

        if (!ignoreResponse) {
          setOrganizationUsers(response.data);
        }
      } catch (error) {
        if (!ignoreResponse) {
          setOrganizationUsers([]);
          setOrganizationUsersError(
            error instanceof Error
              ? error.message
              : 'Failed to load organization users',
          );
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoadingOrganizationUsers(false);
        }
      }
    }

    void fetchOrganizationUsers();

    return () => {
      ignoreResponse = true;
    };
  }, [getOrganizationUsersFn, open, organizationUserSearchQuery]);

  const resetForm = () => {
    form.reset();
    setSelectedOrganizationUser(null);
    setOrganizationUserSearch('');
    setOrganizationUserSearchQuery('');
    setOrganizationUsers([]);
    setOrganizationUsersError(null);
  };

  const form = useForm({
    defaultValues: {
      organizationUserId: '',
      isRoot: false,
    },
    validators: {
      onSubmit: addMemberToOrganizationInputSchema.omit({
        organizationId: true,
        version: true,
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await addMemberToOrganizationFn({
          data: {
            organizationId: organization.id,
            organizationUserId: value.organizationUserId,
            isRoot: value.isRoot,
            version: organization.version,
          },
        });
        toast.success('Member added successfully');
        onOpenChange(false);
        resetForm();
        await router.invalidate();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to add member');
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
          resetForm();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
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
            name="organizationUserId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization User
                  </FieldLabel>
                  <OrganizationUserSearchableDropdown
                    id={field.name}
                    value={field.state.value}
                    selectedOrganizationUser={selectedOrganizationUser}
                    organizationUsers={availableOrganizationUsers}
                    search={organizationUserSearch}
                    isInvalid={isInvalid}
                    isLoading={isLoadingOrganizationUsers}
                    error={organizationUsersError}
                    onSearchChange={setOrganizationUserSearch}
                    onChange={(organizationUser) => {
                      setSelectedOrganizationUser(organizationUser);
                      field.handleChange(organizationUser.organizationUserId);
                    }}
                  />
                  {!isLoadingOrganizationUsers &&
                  availableOrganizationUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No available organization users found.
                    </p>
                  ) : null}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="isRoot"
            children={(field) => (
              <Field className="flex flex-row items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor={field.name}>Root Member</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Grant elevated organization access.
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              </Field>
            )}
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
                form.state.isSubmitting ||
                !selectedOrganizationUser ||
                isSubmitting
              }
            >
              {(form.state.isSubmitting || isSubmitting) && (
                <Spinner className="mr-2" />
              )}
              {form.state.isSubmitting || isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationUserSearchableDropdown({
  id,
  value,
  selectedOrganizationUser,
  organizationUsers,
  search,
  isInvalid,
  isLoading,
  error,
  onSearchChange,
  onChange,
}: Readonly<{
  id: string;
  value: string;
  selectedOrganizationUser: OrganizationUserListItemSchema | null;
  organizationUsers: OrganizationUserListItemSchema[];
  search: string;
  isInvalid: boolean;
  isLoading: boolean;
  error: string | null;
  onSearchChange: (search: string) => void;
  onChange: (organizationUser: OrganizationUserListItemSchema) => void;
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

  const selectedLabel = selectedOrganizationUser
    ? `${selectedOrganizationUser.displayName} (${selectedOrganizationUser.email})`
    : 'Select organization user';

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40',
          !selectedOrganizationUser && 'text-muted-foreground',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={isInvalid}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md">
          <div className="relative mb-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder="Search users..."
              className="h-9 pl-9"
              autoFocus
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div role="listbox" className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Searching...
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="px-2 py-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {!isLoading && !error && organizationUsers.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : null}

            {!isLoading && !error
              ? organizationUsers.map((organizationUser) => (
                  <button
                    key={organizationUser.organizationUserId}
                    type="button"
                    role="option"
                    aria-selected={
                      value === organizationUser.organizationUserId
                    }
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    onClick={() => {
                      onChange(organizationUser);
                      setIsOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        value === organizationUser.organizationUserId
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {organizationUser.displayName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {organizationUser.email}
                      </span>
                    </span>
                  </button>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
