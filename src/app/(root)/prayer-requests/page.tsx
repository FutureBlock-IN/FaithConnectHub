import type { Metadata } from "next";

import { PrayerRequestsListClient } from "@/components/prayer/prayer-requests-list-client";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getApprovedPrayerRequestsCached } from "@/lib/cached-prayer-data";
import { pageContentClass, typePageTitleClass } from "@/lib/responsive-classes";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Prayer Requests",
  description:
    "Share prayer needs and join the FaithConnectHub community in intercession. Submit and support prayer requests with fellow believers.",
  path: "/prayer-requests",
  keywords: ["prayer requests", "Christian prayer", "intercession", "prayer community"],
});

export default async function PrayerRequestsPage() {
  const { churchId } = await getPageChurchContext();
  const requests = await getApprovedPrayerRequestsCached(churchId);

  return (
    <section
      className={pageContentClass}
      aria-labelledby="prayer-requests-heading"
    >
      <header className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Community
        </p>
        <h1 id="prayer-requests-heading" className={typePageTitleClass}>
          Prayer Requests
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Join our community in prayer for these recent requests.
        </p>
      </header>

      <PrayerRequestsListClient initialRequests={requests} />
    </section>
  );
}
