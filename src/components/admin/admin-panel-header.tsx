"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  {
    href: "/admin-worship-panel",
    label: "Worship Admin",
    match: (pathname: string) =>
      pathname === "/admin-worship-panel" ||
      (pathname.startsWith("/admin-worship-panel") &&
        !pathname.startsWith("/admin-worship-panel/analytics")),
  },
  {
    href: "/admin-worship-panel/analytics",
    label: "Analytics",
    icon: BarChart3,
    match: (pathname: string) =>
      pathname.startsWith("/admin-worship-panel/analytics"),
  },
] as const;

export function AdminPanelHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      suppressHydrationWarning
    >
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Left — back */}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md py-2 pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5 shrink-0" aria-hidden />
          <span className="hidden min-[420px]:inline">Back</span>
        </Link>

        {/* Center — admin nav (no absolute positioning) */}
        <nav
          aria-label="Admin sections"
          className="flex min-w-0 items-center justify-center gap-0.5 sm:gap-1"
        >
          {ADMIN_NAV.map((item) => {
            const isActive = item.match(pathname);
            const Icon = "icon" in item ? item.icon : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 max-w-[9.5rem] shrink-0 items-center justify-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors sm:h-10 sm:max-w-none sm:px-3.5 sm:text-xs",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right — balance on mobile; branding on lg+ */}
        <div className="flex w-9 shrink-0 items-center justify-end sm:w-14 lg:w-24 xl:w-auto">
          <div className="hidden items-center gap-2 lg:flex">
            <Image
              src={siteConfig.image}
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-md object-contain"
            />
            <div className="hidden min-w-0 flex-col leading-none xl:flex">
              <span className="truncate font-heading text-sm font-semibold">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
