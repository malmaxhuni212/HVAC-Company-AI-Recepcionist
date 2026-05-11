import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, CalendarCheck, Users, BarChart3, LogOut, Home, DollarSign, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Payments", url: "/admin/payments", icon: DollarSign },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="bg-[#0a1628]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Metro Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/admin"} className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-cta/20 text-cta" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"}`
                    }>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate("/")} className="flex items-center gap-2 px-3 py-2 text-primary-foreground/70 hover:text-primary-foreground w-full">
                    <Home className="h-4 w-4" />{!collapsed && <span>Back to Site</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => signOut()} className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 w-full">
                    <LogOut className="h-4 w-4" />{!collapsed && <span>Sign Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-primary text-primary-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/30 px-4">
            <SidebarTrigger className="text-primary-foreground" />
            <span className="ml-3 font-semibold text-lg">Admin Panel</span>
          </header>
          <main className="admin-scope flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
