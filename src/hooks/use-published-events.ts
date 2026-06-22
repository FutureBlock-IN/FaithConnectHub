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

import { useActiveChurchScope } from "@/context/active-church-context";
import { buildClientScopedQuery } from "@/lib/church-query-builder";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
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
  const { churchId, isLoading: churchResolving } = useActiveChurchScope();
  const [events, setEvents] = useState(initialData);
  const [syncing, setSyncing] = useState(initialData.length === 0);

  useEffect(() => {
    if (MULTI_CHURCH_ENABLED && !churchId) return;

    setSyncing(true);

    const baseQuery = buildClientScopedQuery(
      collection(db, EVENTS_COLLECTION),
      churchId,
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
        setSyncing(false);
      },
      () => {
        setSyncing(false);
      }
    );

    return unsubscribe;
  }, [churchId, maxItems, upcomingOnly]);

  const loading = churchResolving || syncing;

  const grouped = useMemo(
    () => splitEventsBySchedule(events),
    [events]
  );

  return { events, grouped, loading };
}
