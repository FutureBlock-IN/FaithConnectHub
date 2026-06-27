"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import {
  buildPrayerIntercessionId,
  PRAYER_INTERCESSIONS_COLLECTION,
} from "@/lib/prayer-request-firestore";

export function usePrayerIntercession(
  requestId: string,
  userId: string | undefined
) {
  const [hasPrayed, setHasPrayed] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId || !requestId) {
      setHasPrayed(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const intercessionRef = doc(
      db,
      PRAYER_INTERCESSIONS_COLLECTION,
      buildPrayerIntercessionId(requestId, userId)
    );

    const unsubscribe = onSnapshot(
      intercessionRef,
      (snapshot) => {
        setHasPrayed(snapshot.exists());
        setLoading(false);
      },
      () => {
        setHasPrayed(false);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [requestId, userId]);

  return { hasPrayed, loading };
}
