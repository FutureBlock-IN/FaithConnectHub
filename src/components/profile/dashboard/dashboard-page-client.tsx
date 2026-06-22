"use client";

import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardDonationsSection } from "@/components/profile/dashboard/dashboard-donations-section";
import { DashboardPrayerRequestsSection } from "@/components/profile/dashboard/dashboard-prayer-requests-section";
import { DashboardRecentlyViewedSection } from "@/components/profile/dashboard/dashboard-recently-viewed-section";
import { DashboardStatsCards } from "@/components/profile/dashboard/dashboard-stats-cards";
import { DashboardUpcomingEventsSection } from "@/components/profile/dashboard/dashboard-upcoming-events-section";
import { DashboardWelcomeSection } from "@/components/profile/dashboard/dashboard-welcome-section";

export function DashboardPageClient() {
  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary/70">
            <LayoutDashboard className="size-4" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              Dashboard
            </p>
          </div>
          <h1 className="font-heading text-3xl font-bold">My Dashboard</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A personalized overview of your favorites, activity, events, prayer
            requests, and giving history.
          </p>
        </div>

        <Button asChild variant="outline" className="w-fit rounded-full">
          <Link href="/profile">
            <ArrowLeft className="mr-2 size-4" />
            Back to Profile
          </Link>
        </Button>
      </div>

      <DashboardWelcomeSection />
      <DashboardStatsCards />
      <DashboardRecentlyViewedSection />
      <DashboardUpcomingEventsSection />

      <div className="grid gap-8 xl:grid-cols-2">
        <DashboardPrayerRequestsSection />
        <DashboardDonationsSection />
      </div>
    </div>
  );
}
