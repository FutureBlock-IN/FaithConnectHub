import { ImageWithFallback } from "@/components/image-with-fallback";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { NavbarSearchSection } from "../search/navbar-search-section";
import { AuthNav } from "../site-header/auth-nav";
import {
  DesktopPrimaryNav,
  MobilePrimaryNav,
} from "../site-header/header-nav";

export async function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      suppressHydrationWarning
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 md:px-8">

        {/* ── Logo — hard left ── */}
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
        >
          <ImageWithFallback
            src={siteConfig.icon}
            fallback="/images/logo.png"
            alt=""
            aria-hidden
            width={30}
            height={30}
            className="size-7 shrink-0 rounded-md object-contain"
            priority
          />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-bold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
            <span className="text-[10px] text-muted-foreground/50">
              Christian Worship Platform
            </span>
          </div>
        </Link>

        {/* ── Desktop nav — immediately after logo ── */}
        <DesktopPrimaryNav className="ml-6 hidden md:flex" />

        {/* ── Spacer pushes everything right ── */}
        <div className="flex-1" />

        {/* ── Search ── */}
        <NavbarSearchSection className="w-[140px] shrink-0 sm:w-[200px] md:w-[240px] lg:w-[300px]" />

        {/* ── Auth + mobile menu — hard right ── */}
        <div className="ml-3 flex shrink-0 items-center gap-1.5">
          <MobilePrimaryNav className="md:hidden" />
          <AuthNav />
        </div>

      </div>
    </header>
  );
}