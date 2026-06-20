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

import { db } from "@/lib/firebase";
import {
  normalizePrayerRequestFromFirestore,
  PRAYER_REQUESTS_COLLECTION,
} from "@/lib/prayer-request-firestore";

export function useApprovedPrayerRequests(
  initialData: FirebasePrayerRequest[] = [],
  maxItems?: number
) {
  const [requests, setRequests] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);

  useEffect(() => {
    const baseQuery = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
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
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [maxItems]);

  return { requests, loading };
}
