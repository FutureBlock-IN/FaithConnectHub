import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  getEventById,
  getPublishedEventsGrouped,
  getUpcomingPublishedEvents,
} from "./firebase-event-queries";

const REVALIDATE_SECONDS = 60;

export const getUpcomingEventsCached = unstable_cache(
  async () => getUpcomingPublishedEvents(3),
  ["upcoming-events"],
  { revalidate: REVALIDATE_SECONDS, tags: ["events"] }
);

export const getPublishedEventsGroupedCached = unstable_cache(
  async () => getPublishedEventsGrouped(),
  ["published-events-grouped"],
  { revalidate: REVALIDATE_SECONDS, tags: ["events"] }
);

export const getEventByIdCached = cache(async (eventId: string) => {
  return unstable_cache(
    async () => getEventById(eventId),
    ["event-by-id", eventId],
    { revalidate: REVALIDATE_SECONDS, tags: [`event-${eventId}`] }
  )();
});
