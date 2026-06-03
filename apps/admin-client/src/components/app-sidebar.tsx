import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar.tsx';
import { useServerFn } from '@tanstack/react-start';
import { signOut } from '#/features/auth/api';
import {
  Building2,
  CarFront,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  Monitor,
  Moon,
  ParkingCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Users,
} from 'lucide-react';
import { useTheme } from '#/hooks/use-theme';
import { Separator } from '#/components/ui/separator';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { FileRouteTypes } from '#/routeTree.gen.ts';
import { ChangePasswordModal } from '#/features/auth/components/change-password-modal.tsx';
import type { GetMeResponseSchema } from '#/features/auth/schemas';

export function AppSidebar({ user }: Readonly<{ user: GetMeResponseSchema }>) {
  const signOutFn = useServerFn(signOut);
  const { mode, toggleThemeMode } = useTheme();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userInitials = getUserInitials(user.displayName, user.email);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-lg border bg-background/70 p-3 shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <ParkingCircle className="size-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <h1 className="truncate text-sm font-semibold">
                Parking Platform
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Operations admin
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem to="/app" icon={<LayoutDashboard />} label="Dashboard" />
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup title="Reservations">
            <SidebarGroupLabel>Reservations</SidebarGroupLabel>
            <SidebarMenu>
              <DisabledItem icon={<Sparkles />} label="Reservations" />
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup title="Parking">
            <SidebarGroupLabel>Parking</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem
                to="/app/parkings"
                icon={<CarFront />}
                label="Parkings"
              />
              <DisabledItem icon={<Sparkles />} label="Parking Addons" />
              <NavItem
                icon={<ShieldCheck />}
                label="Parking Features"
                to={'/app/parkings/parking-features'}
              />
              <NavItem
                icon={<MapPinned />}
                label="Places"
                to={'/app/parkings/places'}
              />
              <NavItem
                to="/app/parkings/place-types"
                icon={<Map />}
                label="Place Types"
              />
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup title="Organizations">
            <SidebarGroupLabel>Organizations</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem
                icon={<Building2 />}
                label="Organizations"
                to={'/app/organizations'}
              />
              <NavItem
                icon={<Users />}
                label="Organization Users"
                to={'/app/organizations/organization-users'}
              />
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup title="Users">
            <SidebarGroupLabel>Users</SidebarGroupLabel>
            <SidebarMenu>
              <DisabledItem icon={<Users />} label="Users" />
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup title="Admins">
            <SidebarGroupLabel>Admins</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem
                to="/app/admin-users"
                icon={<ShieldCheck />}
                label="Admin Users"
              />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <Separator />
        <SidebarFooter>
          <div
            className="flex items-center gap-3 rounded-lg border bg-background/70 p-3 shadow-xs"
            title={`${user.displayName} (${user.email})`}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground shadow-sm">
              {userInitials ? (
                <span aria-hidden="true">{userInitials}</span>
              ) : (
                <UserRound className="size-4" />
              )}
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium leading-none">
                {user.displayName}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              {user.isSuperAdmin ? (
                <p className="mt-1 truncate text-[0.7rem] font-medium uppercase text-sidebar-primary">
                  Super Admin
                </p>
              ) : null}
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Change Password"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <KeyRound className="size-4" />
                <span>Change Password</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleThemeMode}>
                {mode === 'light' ? (
                  <Sun className="size-4" />
                ) : mode === 'dark' ? (
                  <Moon className="size-4" />
                ) : (
                  <Monitor className="size-4" />
                )}
                <span>
                  Theme:{' '}
                  {mode === 'light'
                    ? 'Light'
                    : mode === 'dark'
                      ? 'Dark'
                      : 'System'}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={async () => await signOutFn()}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </>
  );
}

function getUserInitials(displayName: string, email: string) {
  const source = displayName.trim() || email.trim();

  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function NavItem({
  to,
  icon,
  label,
}: Readonly<{
  to: FileRouteTypes['to'];
  icon: ReactNode;
  label: string;
}>) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={label}>
        <Link
          to={to}
          activeProps={{ 'data-active': true }}
          activeOptions={{ exact: true }}
        >
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DisabledItem({
  icon,
  label,
}: Readonly<{ icon: ReactNode; label: string }>) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton disabled tooltip={label}>
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
