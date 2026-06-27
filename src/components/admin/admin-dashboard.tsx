"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  BookOpen,
  CalendarDays,
  FileText,
  HeartHandshake,
  ListMusic,
  Mic2,
  Star,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlanBadgeFromContext } from "@/components/subscription/plan-badge-from-context";
import { adminSectionClass } from "@/lib/responsive-classes";
import { ChurchSelector } from "@/components/church/church-selector";
import {
  AnalyticsContentGrowthChart,
  AnalyticsDonationsChart,
} from "@/components/admin/analytics/analytics-charts";
import {
  AnalyticsEmptyState,
  AnalyticsInsightCard,
  AnalyticsStatCards,
  type AnalyticsStatDefinition,
} from "@/components/admin/analytics/analytics-stat-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { useAdminChurchBlocked } from "@/hooks/use-admin-collections";
import { useIsPlatformSuperAdmin } from "@/hooks/use-admin-church-id";
import { formatCurrency } from "@/lib/admin-analytics-utils";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
import { formatEventDate } from "@/lib/event-firestore";
import { getPrayerRequestDisplayName, formatPrayerDate } from "@/lib/prayer-request-firestore";

const TAB_REDIRECTS: Record<string, string> = {
  songs: "/admin-worship-panel/content?tab=songs",
  sermons: "/admin-worship-panel/content?tab=sermons",
  articles: "/admin-worship-panel/content?tab=articles",
  events: "/admin-worship-panel/content?tab=events",
  donations: "/admin-worship-panel/content?tab=donations",
  prayers: "/admin-worship-panel/content?tab=prayers",
  churches: "/admin-worship-panel/churches",
};

export function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuperAdmin = useIsPlatformSuperAdmin();
  const analytics = useAdminAnalytics();
  const blocked = useAdminChurchBlocked();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TAB_REDIRECTS[tab]) {
      router.replace(TAB_REDIRECTS[tab]);
    }
  }, [router, searchParams]);

  const statCards: AnalyticsStatDefinition[] = [
    {
      key: "users",
      label: "Total Users",
      value: analytics.counts.users,
      icon: Users,
    },
    {
      key: "songs",
      label: "Total Songs",
      value: analytics.counts.songs,
      icon: ListMusic,
    },
    {
      key: "sermons",
      label: "Total Sermons",
      value: analytics.counts.sermons,
      icon: Mic2,
    },
    {
      key: "articles",
      label: "Total Articles",
      value: analytics.counts.articles,
      icon: FileText,
    },
    {
      key: "prayers",
      label: "Total Prayer Requests",
      value: analytics.counts.prayerRequests,
      icon: HeartHandshake,
    },
    {
      key: "events",
      label: "Total Events",
      value: analytics.counts.events,
      icon: CalendarDays,
    },
    {
      key: "donations",
      label: "Total Donations",
      value: analytics.counts.donations,
      icon: HeartHandshake,
    },
  ];

  const latestPrayers = analytics.recentPrayerRequests.slice(0, 5);
  const latestEvents = analytics.recentEvents.slice(0, 5);
  const recentActivity = [
    ...analytics.recentUsers.slice(0, 3).map((user) => ({
      id: `user-${user.id}`,
      label: `${user.name} joined`,
      meta: user.email || "New member",
      date: user.createdAt,
      href: "/admin-worship-panel/analytics",
    })),
    ...analytics.recentDonations.slice(0, 3).map((donation) => ({
      id: `donation-${donation.id}`,
      label: donation.isAnonymous
        ? "Anonymous donation received"
        : `${donation.donorName} donated`,
      meta: formatCurrency(donation.amount, donation.currency),
      date: donation.createdAt,
      href: "/admin-worship-panel/content?tab=donations",
    })),
    ...latestPrayers.slice(0, 2).map((request) => ({
      id: `prayer-${request.id}`,
      label: `Prayer request: ${request.title}`,
      meta: getPrayerRequestDisplayName(request),
      date: request.createdAt,
      href: "/admin-worship-panel/content?tab=prayers",
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 8);

  return (
    <div className={adminSectionClass}>
      <AdminPageHeader
        eyebrow="Overview"
        title="Admin Dashboard"
        description={`${analytics.scopeLabel} · content and community at a glance`}
      >
        <PlanBadgeFromContext />
        {MULTI_CHURCH_ENABLED && isSuperAdmin ?
          <ChurchSelector compact />
        : null}
      </AdminPageHeader>

      {blocked ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          Select an active church to manage worship content.
        </div>
      ) : null}

      <AnalyticsStatCards
        stats={statCards}
        loading={analytics.loading || analytics.insightsLoading}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsInsightCard
          title="Most Favorited Song"
          description="Based on member favorites"
          itemTitle={analytics.topFavoritedSong?.title}
          metricLabel="Favorites"
          metricValue={analytics.topFavoritedSong?.count}
          loading={analytics.insightsLoading}
          emptyLabel="No song favorites yet"
          icon={Star}
        />
        <AnalyticsInsightCard
          title="Most Viewed Sermon"
          description="Recently viewed, then favorites"
          itemTitle={analytics.topViewedSermon?.title}
          metricLabel="Views"
          metricValue={analytics.topViewedSermon?.count}
          loading={analytics.insightsLoading}
          emptyLabel="No sermon engagement yet"
          icon={Mic2}
        />
        <AnalyticsInsightCard
          title="Most Read Article"
          description="Recently viewed, then favorites"
          itemTitle={analytics.topReadArticle?.title}
          metricLabel="Reads"
          metricValue={analytics.topReadArticle?.count}
          loading={analytics.insightsLoading}
          emptyLabel="No article engagement yet"
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsDonationsChart
          data={analytics.monthlyDonations}
          loading={analytics.loading}
        />
        <AnalyticsContentGrowthChart
          data={analytics.contentGrowth}
          loading={analytics.loading}
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
        <CardHeader className="p-5 pb-3">
          <CardTitle className="font-heading text-base">Recent Activity</CardTitle>
          <CardDescription>Latest platform and community updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5 pt-0">
          {analytics.loading || analytics.insightsLoading ?
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))
          : recentActivity.length > 0 ?
            recentActivity.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {item.date ? format(new Date(item.date), "MMM d") : "—"}
                </p>
              </Link>
            ))
          : <AnalyticsEmptyState label="No recent activity yet" compact />}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LatestListCard
          title="Latest Users"
          description="Newest members"
          loading={analytics.insightsLoading}
          emptyLabel="No members yet"
          href="/admin-worship-panel/analytics"
        >
          {analytics.recentUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email || "New member"}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {user.createdAt ? format(new Date(user.createdAt), "MMM d") : "—"}
              </p>
            </div>
          ))}
        </LatestListCard>

        <LatestListCard
          title="Latest Donations"
          description="Recent gifts"
          loading={analytics.loading}
          emptyLabel="No donations recorded yet"
          href="/admin-worship-panel/donations"
        >
          {analytics.recentDonations.slice(0, 5).map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {donation.isAnonymous ? "Anonymous" : donation.donorName}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {donation.paymentStatus}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatCurrency(donation.amount, donation.currency)}
              </p>
            </div>
          ))}
        </LatestListCard>

        <LatestListCard
          title="Latest Prayer Requests"
          description="Newest submissions"
          loading={analytics.loading}
          emptyLabel="No prayer requests yet"
          href="/admin-worship-panel/prayers"
        >
          {latestPrayers.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{request.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {getPrayerRequestDisplayName(request)}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatPrayerDate(request.createdAt)}
              </p>
            </div>
          ))}
        </LatestListCard>

        <LatestListCard
          title="Latest Events"
          description="Upcoming and recent"
          loading={analytics.loading}
          emptyLabel="No events yet"
          href="/admin-worship-panel/events"
        >
          {latestEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{event.title}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">
                  {event.status}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatEventDate(event.eventDate)}
              </p>
            </div>
          ))}
        </LatestListCard>
      </div>
    </div>
  );
}

function LatestListCard({
  title,
  description,
  loading,
  emptyLabel,
  href,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  emptyLabel: string;
  href: string;
  children: ReactNode;
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const hasItems = childArray.some(Boolean);

  return (
    <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
      <CardHeader className="flex flex-row items-start justify-between gap-2 p-5 pb-3">
        <div>
          <CardTitle className="font-heading text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Link
          href={href}
          className="shrink-0 text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 pt-0">
        {loading ?
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))
        : hasItems ?
          children
        : <AnalyticsEmptyState label={emptyLabel} compact />}
      </CardContent>
    </Card>
  );
}
