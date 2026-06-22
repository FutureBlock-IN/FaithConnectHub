import type { Metadata } from "next";

import { EventsListClient } from "@/components/events/events-list-client";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedEventsGroupedCached } from "@/lib/cached-event-data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Ministry Events",
  description:
    "Discover upcoming and past ministry events on FaithConnectHub — worship services, fellowship gatherings, and special Christian events.",
  path: "/events",
  keywords: ["Christian events", "church events", "ministry gatherings", "worship services"],
});

export default async function EventsPage() {
  const { churchId } = await getPageChurchContext();
  const { upcoming, past } = await getPublishedEventsGroupedCached(churchId);

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8"
      aria-labelledby="events-heading"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Ministry
        </p>
        <h1 id="events-heading" className="font-heading text-2xl font-bold sm:text-3xl">
          Events
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Discover upcoming worship services, fellowship gatherings, and special
          ministry events.
        </p>
      </header>

      <EventsListClient initialUpcoming={upcoming} initialPast={past} />
    </section>
  );
}
