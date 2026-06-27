"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseChurch } from "@/types/firebase-church";
import type {
  FirebaseDonation,
  FirebaseDonationCampaign,
} from "@/types/firebase-donation";
import type { FirebaseEvent } from "@/types/firebase-event";
import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import {
  CHURCHES_COLLECTION,
  normalizeChurchFromFirestore,
} from "@/lib/church-firestore";
import { buildClientScopedQuery } from "@/lib/church-query-builder";
import { filterRecordsByChurch } from "@/lib/church-scope";
import {
  DONATION_CAMPAIGNS_COLLECTION,
  DONATIONS_COLLECTION,
  normalizeDonationCampaignFromFirestore,
  normalizeDonationFromFirestore,
} from "@/lib/donation-firestore";
import {
  EVENTS_COLLECTION,
  normalizeEventFromFirestore,
} from "@/lib/event-firestore";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
import { db } from "@/lib/firebase";
import { normalizePrayerRequestFromFirestore } from "@/lib/prayer-request-firestore";
import {
  LEGACY_SERMONS_COLLECTION,
  SERMONS_COLLECTION,
  mergeSermonsById,
  normalizeSermonFromFirestore,
} from "@/lib/sermon-firestore";
import { normalizeSongFromFirestore } from "@/lib/song-firestore";
import {
  useAdminChurchId,
  useIsPlatformSuperAdmin,
} from "@/hooks/use-admin-church-id";

type CollectionState<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
};

function useChurchScopeGuard(): {
  adminChurchId: string | null;
  blocked: boolean;
} {
  const adminChurchId = useAdminChurchId();
  const blocked = MULTI_CHURCH_ENABLED && !adminChurchId;
  return { adminChurchId, blocked };
}

export function useAdminSongs(): CollectionState<FirebaseSong> {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [data, setData] = useState<FirebaseSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blocked) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const songsQuery = buildClientScopedQuery(
      collection(db, "songs"),
      adminChurchId,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      songsQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) =>
            normalizeSongFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync songs");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    return () => unsubscribe();
  }, [adminChurchId, blocked]);

  return { data, loading, error };
}

export function useAdminSermons(): CollectionState<FirebaseSermon> {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [data, setData] = useState<FirebaseSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sermonSnapshotsRef = useRef<Record<string, FirebaseSermon[]>>({});

  useEffect(() => {
    if (blocked) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    sermonSnapshotsRef.current = {};
    const scopedChurchId = adminChurchId;

    function publishMerged() {
      const merged = mergeSermonsById(
        Object.values(sermonSnapshotsRef.current)
      );
      setData(filterRecordsByChurch(merged, scopedChurchId ?? ""));
      setLoading(false);
      setError(null);
    }

    const unsubscribes = [SERMONS_COLLECTION, LEGACY_SERMONS_COLLECTION].map(
      (collectionName) => {
        const sermonsQuery = buildClientScopedQuery(
          collection(db, collectionName),
          scopedChurchId,
          orderBy("dateCreated", "desc")
        );

        return onSnapshot(
          sermonsQuery,
          (snapshot) => {
            sermonSnapshotsRef.current[collectionName] = snapshot.docs.map(
              (docSnap) =>
                normalizeSermonFromFirestore(
                  docSnap.id,
                  docSnap.data() as Record<string, unknown>
                )
            );
            publishMerged();
          },
          () => {
            sermonSnapshotsRef.current[collectionName] = [];
            publishMerged();
            toast.error("Unable to sync sermons");
            setError("Unable to sync data. Please refresh and try again.");
          }
        );
      }
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [adminChurchId, blocked]);

  return { data, loading, error };
}

export function useAdminArticles(): CollectionState<FirebaseArticle> {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [data, setData] = useState<FirebaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blocked) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const articlesQuery = buildClientScopedQuery(
      collection(db, "articles"),
      adminChurchId,
      orderBy("dateCreated", "desc")
    );

    const unsubscribe = onSnapshot(
      articlesQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) =>
            normalizeArticleFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync articles");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    return () => unsubscribe();
  }, [adminChurchId, blocked]);

  return { data, loading, error };
}

export function useAdminEvents(): CollectionState<FirebaseEvent> {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [data, setData] = useState<FirebaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blocked) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const eventsQuery = buildClientScopedQuery(
      collection(db, EVENTS_COLLECTION),
      adminChurchId,
      orderBy("eventDate", "desc")
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) =>
            normalizeEventFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync events");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    return () => unsubscribe();
  }, [adminChurchId, blocked]);

  return { data, loading, error };
}

export function useAdminDonations(): {
  campaigns: FirebaseDonationCampaign[];
  donations: FirebaseDonation[];
  loading: boolean;
  error: string | null;
} {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [campaigns, setCampaigns] = useState<FirebaseDonationCampaign[]>([]);
  const [donations, setDonations] = useState<FirebaseDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blocked) {
      setCampaigns([]);
      setDonations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const campaignsQuery = buildClientScopedQuery(
      collection(db, DONATION_CAMPAIGNS_COLLECTION),
      adminChurchId,
      orderBy("createdAt", "desc")
    );
    const donationsQuery = buildClientScopedQuery(
      collection(db, DONATIONS_COLLECTION),
      adminChurchId,
      orderBy("createdAt", "desc")
    );

    const unsubscribeCampaigns = onSnapshot(
      campaignsQuery,
      (snapshot) => {
        setCampaigns(
          snapshot.docs.map((docSnap) =>
            normalizeDonationCampaignFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync donation campaigns");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    const unsubscribeDonations = onSnapshot(
      donationsQuery,
      (snapshot) => {
        setDonations(
          snapshot.docs.map((docSnap) =>
            normalizeDonationFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
      },
      () => toast.error("Unable to sync donations")
    );

    return () => {
      unsubscribeCampaigns();
      unsubscribeDonations();
    };
  }, [adminChurchId, blocked]);

  return { campaigns, donations, loading, error };
}

export function useAdminPrayerRequests(): CollectionState<FirebasePrayerRequest> {
  const { adminChurchId, blocked } = useChurchScopeGuard();
  const [data, setData] = useState<FirebasePrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blocked) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const prayersQuery = buildClientScopedQuery(
      collection(db, "prayerRequests"),
      adminChurchId,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      prayersQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) =>
            normalizePrayerRequestFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync prayer requests");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    return () => unsubscribe();
  }, [adminChurchId, blocked]);

  return { data, loading, error };
}

export function useAdminChurches(): CollectionState<FirebaseChurch> {
  const isSuperAdmin = useIsPlatformSuperAdmin();
  const [data, setData] = useState<FirebaseChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!MULTI_CHURCH_ENABLED || !isSuperAdmin) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const churchesQuery = query(
      collection(db, CHURCHES_COLLECTION),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      churchesQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) =>
            normalizeChurchFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setLoading(false);
        setError(null);
      },
      () => {
        toast.error("Unable to sync churches");
        setLoading(false);
        setError("Unable to sync data. Please refresh and try again.");
      }
    );

    return () => unsubscribe();
  }, [isSuperAdmin]);

  return { data, loading, error };
}

export function useAdminChurchBlocked(): boolean {
  const { blocked } = useChurchScopeGuard();
  return blocked;
}

export { useAdminChurchId, useIsPlatformSuperAdmin };
