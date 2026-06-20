"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { useActiveChurchScope } from "@/context/active-church-context";
import { db } from "@/lib/firebase";
import {
  normalizePrayerRequestFromFirestore,
  PRAYER_REQUESTS_COLLECTION,
} from "@/lib/prayer-request-firestore";

export function useApprovedPrayerRequests(
  initialData: FirebasePrayerRequest[] = [],
  maxItems?: number
) {
  const { churchId, isLoading: churchResolving } = useActiveChurchScope();
  const [requests, setRequests] = useState(initialData);
  const [syncing, setSyncing] = useState(initialData.length === 0);

  useEffect(() => {
    if (!churchId) return;

    setSyncing(true);

    const baseQuery = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      where("churchId", "==", churchId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const prayersQuery =
      maxItems ? query(baseQuery, limit(maxItems)) : baseQuery;

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
  }, [churchId, maxItems]);

  const loading = churchResolving || syncing;

  return { requests, loading };
}
