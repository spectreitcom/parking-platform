import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar.tsx';
import { useServerFn } from '@tanstack/react-start';
import { signOut } from '#/features/auth/api';
import { LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '#/hooks/use-theme';
import { Separator } from '#/components/ui/separator';
import { Link } from '@tanstack/react-router';

export function AppSidebar() {
  const signOutFn = useServerFn(signOut);
  const { mode, toggleThemeMode } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <h1>Parking Platform Parking</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={'/app'}>Dashboard</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>Reservations</SidebarMenuItem>
            <SidebarMenuItem>Parkings</SidebarMenuItem>
            <SidebarMenuItem>Parking Addons</SidebarMenuItem>
            <SidebarMenuItem>Parking Features</SidebarMenuItem>
            <SidebarMenuItem>Object Types</SidebarMenuItem>
            <SidebarMenuItem>Organizations</SidebarMenuItem>
            <SidebarMenuItem>Organization Users</SidebarMenuItem>
            <SidebarMenuItem>Users</SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={'/app/admin-users'}>Admin Users</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
                Motyw:{' '}
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
