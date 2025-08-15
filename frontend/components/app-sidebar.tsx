"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, Car, Factory, TrendingUp, Settings, Info } from "lucide-react";
import Link from "next/link";

export function AppSidebar({
  variant,
}: {
  variant?: "sidebar" | "floating" | "inset";
}) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      label: "Vehicle Types",
      icon: Car,
      href: "/vehicle-types",
    },
    {
      label: "Manufacturers",
      icon: Factory,
      href: "/manufacturers",
    },
    {
      label: "Growth Trends",
      icon: TrendingUp,
      href: "/growth-trends",
    },
  ];

  return (
    <Sidebar variant={variant} className="border-r bg-background md:bg-sidebar">
      <SidebarHeader className="border-b border-border bg-slate-200 md:bg-sidebar md:border-sidebar-border">
        <div className="flex items-center justify-center h-10 px-4">
          <span className="text-base md:text-lg font-semibold text-foreground md:text-sidebar-foreground">
            Vahan Insights
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-200 md:bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground md:text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className="text-foreground hover:bg-accent hover:text-accent-foreground md:text-sidebar-foreground md:hover:bg-sidebar-accent md:hover:text-sidebar-accent-foreground"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-border md:bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground md:text-sidebar-foreground/70">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-foreground hover:bg-accent hover:text-accent-foreground md:text-sidebar-foreground md:hover:bg-sidebar-accent md:hover:text-sidebar-accent-foreground"
                >
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-foreground hover:bg-accent hover:text-accent-foreground md:text-sidebar-foreground md:hover:bg-sidebar-accent md:hover:text-sidebar-accent-foreground"
                >
                  <Link
                    href="/about"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Info className="h-4 w-4" />
                    <span className="text-sm">About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border bg-slate-200 md:bg-sidebar md:border-sidebar-border">
        <div className="p-2 text-xs text-center text-muted-foreground md:text-sidebar-foreground/70">
          {currentYear ? `© ${currentYear} Vahan Insights` : null}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
