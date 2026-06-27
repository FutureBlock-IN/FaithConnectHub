"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AppNavGroup } from "@/config/app-sidebar-nav";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsPlatformSuperAdmin } from "@/hooks/use-admin-church-id";
import { useFirebaseAuth } from "@/context/firebase-auth-context";

export function NavAppGroups({ groups }: { groups: AppNavGroup[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isSuperAdmin = useIsPlatformSuperAdmin();
  const { user } = useFirebaseAuth();

  return (
    <>
      {groups.map((group, index) => {
        const visibleItems = group.items.filter((item) => {
          if (item.authOnly && !user) return false;
          if (item.superAdminOnly && !isSuperAdmin) return false;
          return true;
        });

        if (visibleItems.length === 0) return null;

        return (
          <SidebarGroup
            key={group.label ?? `group-${index}`}
            className="px-2 py-0.5"
          >
            {group.separated ?
              <SidebarSeparator className="my-1.5" />
            : null}
            {group.label ?
              <SidebarGroupLabel className="h-7 px-2 text-[11px]">
                {group.label}
              </SidebarGroupLabel>
            : null}
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.match(pathname)}
                      tooltip={item.label}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
