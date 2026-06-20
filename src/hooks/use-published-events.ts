"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type { FirebaseEvent } from "@/types/firebase-event";

import { db } from "@/lib/firebase";
import {
  EVENTS_COLLECTION,
  filterPublishedEvents,
  normalizeEventFromFirestore,
  splitEventsBySchedule,
} from "@/lib/event-firestore";

type UsePublishedEventsOptions = {
  maxItems?: number;
  upcomingOnly?: boolean;
};

export function usePublishedEvents(
  initialData: FirebaseEvent[] = [],
  options?: UsePublishedEventsOptions
) {
  const { maxItems, upcomingOnly = false } = options ?? {};
  const [events, setEvents] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);

  useEffect(() => {
    const baseQuery = query(
      collection(db, EVENTS_COLLECTION),
      where("status", "==", "published"),
      orderBy("eventDate", "asc")
    );
    const eventsQuery = maxItems ? query(baseQuery, limit(maxItems * 4)) : baseQuery;

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        let next = snapshot.docs.map((docSnap) =>
          normalizeEventFromFirestore(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        );

        next = filterPublishedEvents(next);

        if (upcomingOnly) {
          next = splitEventsBySchedule(next).upcoming;
        }

        if (maxItems) {
          next = next.slice(0, maxItems);
        }

        setEvents(next);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [maxItems, upcomingOnly]);

  const grouped = useMemo(
    () => splitEventsBySchedule(events),
    [events]
  );

  return { events, grouped, loading };
}
