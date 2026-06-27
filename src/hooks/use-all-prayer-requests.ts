"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy } from "firebase/firestore";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { useActiveChurchScope } from "@/context/active-church-context";
import { buildClientScopedQuery } from "@/lib/church-query-builder";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
import { db } from "@/lib/firebase";
import {
  normalizePrayerRequestFromFirestore,
  PRAYER_REQUESTS_COLLECTION,
} from "@/lib/prayer-request-firestore";

/**
 * Admin-only: subscribe to ALL prayer requests (pending, approved, rejected)
 * scoped to the active church so moderators can review and act on them.
 * Mirrors `useApprovedPrayerRequests` but without the public status filter.
 */
export function useAllPrayerRequests(
  initialData: FirebasePrayerRequest[] = []
) {
  const { churchId, isLoading: churchResolving } = useActiveChurchScope();
  const [requests, setRequests] = useState(initialData);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (MULTI_CHURCH_ENABLED && !churchId) return;

    setSyncing(true);

    const prayersQuery = buildClientScopedQuery(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      churchId,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      prayersQuery,
      (snapshot) => {
        setRequests(
          snapshot.docs.map((docSnap) =>
            normalizePrayerRequestFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setSyncing(false);
      },
      () => {
        setSyncing(false);
      }
    );

    return unsubscribe;
  }, [churchId]);

  const loading = churchResolving || syncing;

  return { requests, loading };
}
