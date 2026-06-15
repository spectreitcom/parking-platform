import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { Building2Icon, CarFrontIcon, LayoutDashboardIcon } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '#/components/ui/sidebar.tsx';

type Organization = {
  id: string;
  name: string;
  isRoot: boolean;
};

type AppSidebarProps = {
  organizations: Array<Organization>;
};

export function AppSidebar({ organizations }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <CarFrontIcon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">Parking Manager</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Operations console
            </p>
          </div>
        </div>
        <OrganizationSwitcher organizations={organizations} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link to="/app">
                    <LayoutDashboardIcon aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function OrganizationSwitcher({ organizations }: AppSidebarProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeOrganizationId =
    'organizationId' in params ? params.organizationId : undefined;
  const selectedOrganizationId =
    activeOrganizationId ?? organizations.at(0)?.id ?? '';

  if (organizations.length === 0) {
    return (
      <div className="mx-2 rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
        No organization assigned
      </div>
    );
  }

  return (
    <div className="px-2 group-data-[collapsible=icon]:hidden">
      <Select
        value={selectedOrganizationId}
        onValueChange={(organizationId) =>
          navigate({
            to: '/app/$organizationId',
            params: { organizationId },
          })
        }
      >
        <SelectTrigger
          className="h-10 w-full border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
          aria-label="Select organization"
        >
          <Building2Icon className="size-4" aria-hidden="true" />
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((organization) => (
            <SelectItem key={organization.id} value={organization.id}>
              {organization.name}
              {organization.isRoot ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  Root
                </span>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
