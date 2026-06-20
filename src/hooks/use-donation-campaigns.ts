"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type { FirebaseDonationCampaign } from "@/types/firebase-donation";

import { useActiveChurchScope } from "@/context/active-church-context";
import {
  DONATION_CAMPAIGNS_COLLECTION,
  filterActiveCampaigns,
  normalizeDonationCampaignFromFirestore,
} from "@/lib/donation-firestore";
import { db } from "@/lib/firebase";

type UseActiveDonationCampaignsOptions = {
  maxItems?: number;
};

export function useActiveDonationCampaigns(
  initialData: FirebaseDonationCampaign[] = [],
  options: UseActiveDonationCampaignsOptions = {}
) {
  const { maxItems } = options;
  const { churchId, isLoading: churchResolving } = useActiveChurchScope();
  const [campaigns, setCampaigns] = useState(initialData);
  const [syncing, setSyncing] = useState(initialData.length === 0);

  useEffect(() => {
    if (!churchId) return;

    setSyncing(true);

    const campaignsQuery = query(
      collection(db, DONATION_CAMPAIGNS_COLLECTION),
      where("churchId", "==", churchId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      campaignsQuery,
      (snapshot) => {
        let next = filterActiveCampaigns(
          snapshot.docs.map((docSnap) =>
            normalizeDonationCampaignFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );

        if (maxItems !== undefined) {
          next = next.slice(0, maxItems);
        }

        setCampaigns(next);
        setSyncing(false);
      },
      () => setSyncing(false)
    );

    return unsubscribe;
  }, [churchId, maxItems]);

  const loading = churchResolving || syncing;

  return { campaigns, loading };
}

export function useDonationCampaign(
  campaignId: string,
  initialData?: FirebaseDonationCampaign | null
) {
  const [campaign, setCampaign] = useState(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, DONATION_CAMPAIGNS_COLLECTION, campaignId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setCampaign(null);
        } else {
          setCampaign(
            normalizeDonationCampaignFromFirestore(
              snapshot.id,
              snapshot.data() as Record<string, unknown>
            )
          );
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [campaignId]);

  return { campaign, loading };
}
