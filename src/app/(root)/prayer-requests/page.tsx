import { PrayerRequestsListClient } from "@/components/prayer/prayer-requests-list-client";
import { getApprovedPrayerRequestsCached } from "@/lib/cached-prayer-data";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata = {
  title: "Prayer Requests",
  description: `Share your prayer needs with the community on ${siteConfig.name}.`,
};

export default async function PrayerRequestsPage() {
  const requests = await getApprovedPrayerRequestsCached();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Community
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          Prayer Requests
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Join our community in prayer for these recent requests.
        </p>
      </div>

      <PrayerRequestsListClient initialRequests={requests} />
    </div>
  );
}
