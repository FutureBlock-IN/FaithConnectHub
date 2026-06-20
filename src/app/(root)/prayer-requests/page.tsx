import { PrayerRequestsListClient } from "@/components/prayer/prayer-requests-list-client";
import { SubmitPrayerRequestButton } from "@/components/prayer/submit-prayer-request-button";
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
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Share your prayer needs with the community.
        </p>
        <SubmitPrayerRequestButton className="rounded-full" />
      </div>

      <PrayerRequestsListClient initialRequests={requests} />
    </div>
  );
}
