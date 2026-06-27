"use client";

import { useMemo } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_NAV_GROUPS, getAdminNavGroup, getLibraryNavGroup } from "@/config/app-sidebar-nav";
import { useFirebaseAuth } from "@/context/firebase-auth-context";

import { ChurchBrand } from "./church-brand";
import { NavAppGroups } from "./nav-app-groups";

export function AppSidebar() {
  const { isAdmin, user } = useFirebaseAuth();

  const navGroups = useMemo(() => {
    const groups = [...APP_NAV_GROUPS];
    if (user) groups.push(getLibraryNavGroup());
    if (isAdmin) groups.push(getAdminNavGroup());
    return groups;
  }, [user, isAdmin]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ChurchBrand />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavAppGroups groups={navGroups} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
