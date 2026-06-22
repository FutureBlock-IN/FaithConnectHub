import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  getEventById,
  getPublishedEventsGrouped,
  getUpcomingPublishedEvents,
} from "./firebase-event-queries";
import { recordMatchesChurchScope } from "./church-scope";

const REVALIDATE_SECONDS = 60;

export async function getUpcomingEventsCached(churchId: string) {
  return unstable_cache(
    async () => getUpcomingPublishedEvents(churchId, 3),
    ["upcoming-events", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["events", `church-${churchId}`] }
  )();
}

export async function getPublishedEventsGroupedCached(churchId: string) {
  return unstable_cache(
    async () => getPublishedEventsGrouped(churchId),
    ["published-events-grouped", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["events", `church-${churchId}`] }
  )();
}

export const getEventByIdCached = cache(
  async (churchId: string, eventId: string) => {
    return unstable_cache(
      async () => {
        const event = await getEventById(eventId);
        if (!recordMatchesChurchScope(event, churchId)) return null;
        return event;
      },
      ["event-by-id", churchId, eventId],
      {
        revalidate: REVALIDATE_SECONDS,
        tags: [`event-${eventId}`, `church-${churchId}`],
      }
    )();
  }
);
