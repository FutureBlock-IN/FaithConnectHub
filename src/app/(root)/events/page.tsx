import { EventsListClient } from "@/components/events/events-list-client";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedEventsGroupedCached } from "@/lib/cached-event-data";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata = {
  title: "Events",
  description: `Browse upcoming and past ministry events on ${siteConfig.name}.`,
};

export default async function EventsPage() {
  const { churchId } = await getPageChurchContext();
  const { upcoming, past } = await getPublishedEventsGroupedCached(churchId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Ministry
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Events</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Discover upcoming worship services, fellowship gatherings, and special
          ministry events.
        </p>
      </div>

      <EventsListClient initialUpcoming={upcoming} initialPast={past} />
    </div>
  );
}
