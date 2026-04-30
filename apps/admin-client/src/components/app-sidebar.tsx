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
  Users,
} from 'lucide-react';
import { useTheme } from '#/hooks/use-theme';
import { Separator } from '#/components/ui/separator';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import type { FileRouteTypes } from '#/routeTree.gen.ts';

export function AppSidebar() {
  const signOutFn = useServerFn(signOut);
  const { mode, toggleThemeMode } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg border bg-background/70 p-3 shadow-xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <ParkingCircle className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <h1 className="truncate text-sm font-semibold">Parking Platform</h1>
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
            <NavItem to="/app/parkings" icon={<CarFront />} label="Parkings" />
            <DisabledItem icon={<Sparkles />} label="Parking Addons" />
            <DisabledItem icon={<ShieldCheck />} label="Parking Features" />
            <DisabledItem icon={<MapPinned />} label="Places" />
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
            <DisabledItem icon={<Building2 />} label="Organizations" />
            <DisabledItem icon={<Users />} label="Organization Users" />
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
        <SidebarMenu>
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
  );
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
