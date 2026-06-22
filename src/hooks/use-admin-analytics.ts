"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {

  collection,

  getCountFromServer,

  limit,

  onSnapshot,

  orderBy,

  query,

  where,

  type QueryConstraint,

} from "firebase/firestore";



import type { FirebaseArticle } from "@/types/firebase-article";

import type { FirebaseDonation } from "@/types/firebase-donation";

import type { FirebaseEvent } from "@/types/firebase-event";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import type { FirebaseSermon } from "@/types/firebase-sermon";

import type { FirebaseSong } from "@/types/firebase-song";



import {

  aggregateContentGrowth,

  aggregateMonthlyDonations,

  buildCountsFromRecords,

  normalizeUserCreatedAt,

  rankContentByCounts,

  type AnalyticsContentItem,

  type ContentGrowthPoint,

  type MonthlyDonationPoint,

  type RankedContentInsight,

  type RecentUserRow,

} from "@/lib/admin-analytics-utils";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";

import {

  DONATIONS_COLLECTION,

  normalizeDonationFromFirestore,

} from "@/lib/donation-firestore";

import {

  EVENTS_COLLECTION,

  normalizeEventFromFirestore,

} from "@/lib/event-firestore";

import { FAVORITES_COLLECTION } from "@/lib/favorite-firestore";

import { db } from "@/lib/firebase";

import { firebaseAuth } from "@/lib/firebase-auth-service";

import { normalizePrayerRequestFromFirestore } from "@/lib/prayer-request-firestore";

import { RECENTLY_VIEWED_COLLECTION } from "@/lib/recently-viewed-firestore";

import {

  LEGACY_SERMONS_COLLECTION,

  SERMONS_COLLECTION,

  mergeSermonsById,

  normalizeSermonFromFirestore,

} from "@/lib/sermon-firestore";

import { normalizeSongFromFirestore } from "@/lib/song-firestore";

import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";

import { useAdminChurchId, useIsPlatformSuperAdmin } from "@/hooks/use-admin-church-id";



type AdminAnalyticsInsightsResponse = {

  topFavoritedSong: RankedContentInsight | null;

  topViewedSermon: RankedContentInsight | null;

  topReadArticle: RankedContentInsight | null;

  recentUsers: RecentUserRow[];

  userCount: number;

};



export type AdminAnalyticsState = {

  loading: boolean;

  insightsLoading: boolean;

  adminSdkUnavailable: boolean;

  counts: {

    songs: number;

    sermons: number;

    articles: number;

    prayerRequests: number;

    events: number;

    donations: number;

    users: number;

  };

  topFavoritedSong: RankedContentInsight | null;

  topViewedSermon: RankedContentInsight | null;

  topReadArticle: RankedContentInsight | null;

  recentUsers: RecentUserRow[];

  recentDonations: FirebaseDonation[];

  monthlyDonations: MonthlyDonationPoint[];

  contentGrowth: ContentGrowthPoint[];

  scopeLabel: string;

  usingInsightsApi: boolean;

};



function buildScopedQuery(

  collectionName: string,

  churchScope: string | null,

  orderField: string,

  direction: "asc" | "desc" = "desc"

) {

  const constraints: QueryConstraint[] = [];



  if (churchScope && MULTI_CHURCH_ENABLED) {

    constraints.push(where("churchId", "==", churchScope));

  }



  constraints.push(orderBy(orderField, direction));

  return query(collection(db, collectionName), ...constraints);

}



function mapUserDocToRow(

  id: string,

  data: Record<string, unknown>

): RecentUserRow {

  const firstName = String(data.firstName ?? "").trim();

  const lastName = String(data.lastName ?? "").trim();

  const name = [firstName, lastName].filter(Boolean).join(" ") || "Member";



  return {

    id,

    name,

    email: String(data.email ?? "").trim(),

    createdAt: normalizeUserCreatedAt(data.createdAt),

  };

}



export function useAdminAnalytics(): AdminAnalyticsState {

  const adminChurchId = useAdminChurchId();

  const isSuperAdmin = useIsPlatformSuperAdmin();

  const churchScope = MULTI_CHURCH_ENABLED

    ? isSuperAdmin ? null : adminChurchId

    : null;



  const [songs, setSongs] = useState<FirebaseSong[]>([]);

  const [sermons, setSermons] = useState<FirebaseSermon[]>([]);

  const [articles, setArticles] = useState<FirebaseArticle[]>([]);

  const [events, setEvents] = useState<FirebaseEvent[]>([]);

  const [prayerRequests, setPrayerRequests] = useState<FirebasePrayerRequest[]>(

    []

  );

  const [donations, setDonations] = useState<FirebaseDonation[]>([]);

  const [recentUsers, setRecentUsers] = useState<RecentUserRow[]>([]);

  const [userCount, setUserCount] = useState(0);

  const [topFavoritedSong, setTopFavoritedSong] =

    useState<RankedContentInsight | null>(null);

  const [topViewedSermon, setTopViewedSermon] =

    useState<RankedContentInsight | null>(null);

  const [topReadArticle, setTopReadArticle] =

    useState<RankedContentInsight | null>(null);



  const [loading, setLoading] = useState(true);

  const [insightsLoading, setInsightsLoading] = useState(true);

  const [usingInsightsApi, setUsingInsightsApi] = useState(false);

  const [adminSdkUnavailable, setAdminSdkUnavailable] = useState(false);



  const sermonSnapshotsRef = useRef<Record<string, FirebaseSermon[]>>({});

  const loadedCollectionsRef = useRef(0);

  const expectedCollections = 6;



  const markCollectionLoaded = useCallback(() => {

    loadedCollectionsRef.current += 1;

    if (loadedCollectionsRef.current >= expectedCollections) {

      setLoading(false);

    }

  }, [expectedCollections]);



  useEffect(() => {

    loadedCollectionsRef.current = 0;

    setLoading(true);



    if (MULTI_CHURCH_ENABLED && !isSuperAdmin && !churchScope) {

      setSongs([]);

      setSermons([]);

      setArticles([]);

      setEvents([]);

      setPrayerRequests([]);

      setDonations([]);

      setLoading(false);

      return;

    }



    const unsubscribes: Array<() => void> = [];



    unsubscribes.push(

      onSnapshot(

        buildScopedQuery("songs", churchScope, "createdAt"),

        (snapshot) => {

          setSongs(

            snapshot.docs.map((docSnap) =>

              normalizeSongFromFirestore(

                docSnap.id,

                docSnap.data() as Record<string, unknown>

              )

            )

          );

          markCollectionLoaded();

        },

        () => {

          markCollectionLoaded();

        }

      )

    );



    sermonSnapshotsRef.current = {};

    const scopedChurchId = churchScope;



    for (const collectionName of [SERMONS_COLLECTION, LEGACY_SERMONS_COLLECTION]) {

      unsubscribes.push(

        onSnapshot(

          buildScopedQuery(collectionName, churchScope, "dateCreated"),

          (snapshot) => {

            sermonSnapshotsRef.current[collectionName] = snapshot.docs.map(

              (docSnap) =>

                normalizeSermonFromFirestore(

                  docSnap.id,

                  docSnap.data() as Record<string, unknown>

                )

            );



            const merged = mergeSermonsById(

              Object.values(sermonSnapshotsRef.current)

            );

            setSermons(

              MULTI_CHURCH_ENABLED && scopedChurchId

                ? merged.filter((item) => item.churchId === scopedChurchId)

                : merged

            );



            if (collectionName === SERMONS_COLLECTION) {

              markCollectionLoaded();

            }

          },

          () => {

            sermonSnapshotsRef.current[collectionName] = [];

            if (collectionName === SERMONS_COLLECTION) {

              markCollectionLoaded();

            }

          }

        )

      );

    }



    unsubscribes.push(

      onSnapshot(

        buildScopedQuery("articles", churchScope, "dateCreated"),

        (snapshot) => {

          setArticles(

            snapshot.docs.map((docSnap) =>

              normalizeArticleFromFirestore(

                docSnap.id,

                docSnap.data() as Record<string, unknown>

              )

            )

          );

          markCollectionLoaded();

        },

        () => {

          markCollectionLoaded();

        }

      )

    );



    unsubscribes.push(

      onSnapshot(

        buildScopedQuery(EVENTS_COLLECTION, churchScope, "eventDate"),

        (snapshot) => {

          setEvents(

            snapshot.docs.map((docSnap) =>

              normalizeEventFromFirestore(

                docSnap.id,

                docSnap.data() as Record<string, unknown>

              )

            )

          );

          markCollectionLoaded();

        },

        () => {

          markCollectionLoaded();

        }

      )

    );



    unsubscribes.push(

      onSnapshot(

        buildScopedQuery("prayerRequests", churchScope, "createdAt"),

        (snapshot) => {

          setPrayerRequests(

            snapshot.docs.map((docSnap) =>

              normalizePrayerRequestFromFirestore(

                docSnap.id,

                docSnap.data() as Record<string, unknown>

              )

            )

          );

          markCollectionLoaded();

        },

        () => {

          markCollectionLoaded();

        }

      )

    );



    unsubscribes.push(

      onSnapshot(

        buildScopedQuery(DONATIONS_COLLECTION, churchScope, "createdAt"),

        (snapshot) => {

          setDonations(

            snapshot.docs.map((docSnap) =>

              normalizeDonationFromFirestore(

                docSnap.id,

                docSnap.data() as Record<string, unknown>

              )

            )

          );

          markCollectionLoaded();

        },

        () => {

          markCollectionLoaded();

        }

      )

    );



    return () => {

      unsubscribes.forEach((unsubscribe) => unsubscribe());

    };

  }, [churchScope, isSuperAdmin, markCollectionLoaded]);



  const songItems = useMemo<AnalyticsContentItem[]>(

    () =>

      songs.map((song) => ({

        id: song.id,

        title: song.songTitle || song.title,

        churchId: song.churchId,

      })),

    [songs]

  );



  const sermonItems = useMemo<AnalyticsContentItem[]>(

    () =>

      sermons.map((sermon) => ({

        id: sermon.id,

        title: sermon.title,

        churchId: sermon.churchId,

      })),

    [sermons]

  );



  const articleItems = useMemo<AnalyticsContentItem[]>(

    () =>

      articles.map((article) => ({

        id: article.id,

        title: article.title,

        churchId: article.churchId,

      })),

    [articles]

  );



  useEffect(() => {

    if (MULTI_CHURCH_ENABLED && !isSuperAdmin && !churchScope) {

      setInsightsLoading(false);

      return;

    }



    let cancelled = false;

    let apiActive = true;

    const clientUnsubscribes: Array<() => void> = [];



    function applyInsightsPayload(payload: AdminAnalyticsInsightsResponse) {

      if (cancelled) return;

      setTopFavoritedSong(payload.topFavoritedSong);

      setTopViewedSermon(payload.topViewedSermon);

      setTopReadArticle(payload.topReadArticle);

      setRecentUsers(payload.recentUsers);

      setUserCount(payload.userCount);

      setInsightsLoading(false);

    }



    function refreshUserCount() {

      const countConstraints: QueryConstraint[] = [];

      if (churchScope && MULTI_CHURCH_ENABLED) {

        countConstraints.push(where("churchId", "==", churchScope));

      }



      const countQuery = query(collection(db, "users"), ...countConstraints);

      void getCountFromServer(countQuery)

        .then((snapshot) => {

          if (!cancelled) {

            setUserCount(snapshot.data().count);

          }

        })

        .catch(() => {

          // Count may fail if rules deny access; leave prior value.

        });

    }



    function startClientFallback(includeEngagement: boolean) {

      if (cancelled) return;



      apiActive = false;

      setUsingInsightsApi(false);



      const recentUsersConstraints: QueryConstraint[] = [];

      if (churchScope && MULTI_CHURCH_ENABLED) {

        recentUsersConstraints.push(where("churchId", "==", churchScope));

      }

      recentUsersConstraints.push(orderBy("createdAt", "desc"), limit(8));



      clientUnsubscribes.push(

        onSnapshot(

          query(collection(db, "users"), ...recentUsersConstraints),

          (snapshot) => {

            if (cancelled) return;

            setRecentUsers(

              snapshot.docs.map((docSnap) =>

                mapUserDocToRow(

                  docSnap.id,

                  docSnap.data() as Record<string, unknown>

                )

              )

            );

            setInsightsLoading(false);

          },

          () => {

            if (!cancelled) {

              setInsightsLoading(false);

            }

          }

        )

      );



      refreshUserCount();



      if (!includeEngagement) {

        return;

      }



      const allowedSongIds = new Set(songItems.map((item) => item.id));

      const allowedSermonIds = new Set(sermonItems.map((item) => item.id));

      const allowedArticleIds = new Set(articleItems.map((item) => item.id));



      const favoriteRecords: Array<{ itemId: string; itemType: string }> = [];

      const viewedRecords: Array<{ itemId: string; itemType: string }> = [];



      function publishLiveInsights() {

        if (cancelled) return;

        setTopFavoritedSong(

          rankContentByCounts(

            buildCountsFromRecords(favoriteRecords, "song"),

            songItems

          )

        );



        const sermonViews = buildCountsFromRecords(viewedRecords, "sermon");

        const sermonFavorites = buildCountsFromRecords(favoriteRecords, "sermon");

        setTopViewedSermon(

          rankContentByCounts(sermonViews, sermonItems) ??

            rankContentByCounts(sermonFavorites, sermonItems)

        );



        const articleViews = buildCountsFromRecords(viewedRecords, "article");

        const articleFavorites = buildCountsFromRecords(

          favoriteRecords,

          "article"

        );

        setTopReadArticle(

          rankContentByCounts(articleViews, articleItems) ??

            rankContentByCounts(articleFavorites, articleItems)

        );

      }



      clientUnsubscribes.push(

        onSnapshot(

          collection(db, FAVORITES_COLLECTION),

          (snapshot) => {

            favoriteRecords.length = 0;

            for (const docSnap of snapshot.docs) {

              const record = docSnap.data();

              const itemType = String(record.itemType ?? "");

              const itemId = String(record.itemId ?? "");

              if (itemType === "song" && allowedSongIds.has(itemId)) {

                favoriteRecords.push({ itemId, itemType });

              } else if (itemType === "sermon" && allowedSermonIds.has(itemId)) {

                favoriteRecords.push({ itemId, itemType });

              } else if (itemType === "article" && allowedArticleIds.has(itemId)) {

                favoriteRecords.push({ itemId, itemType });

              }

            }

            publishLiveInsights();

          },

          () => {

            // Engagement metrics unavailable without Admin SDK or super-admin read access.

          }

        )

      );



      clientUnsubscribes.push(

        onSnapshot(

          collection(db, RECENTLY_VIEWED_COLLECTION),

          (snapshot) => {

            viewedRecords.length = 0;

            for (const docSnap of snapshot.docs) {

              const record = docSnap.data();

              const itemType = String(record.itemType ?? "");

              const itemId = String(record.itemId ?? "");

              if (itemType === "sermon" && allowedSermonIds.has(itemId)) {

                viewedRecords.push({ itemId, itemType });

              } else if (itemType === "article" && allowedArticleIds.has(itemId)) {

                viewedRecords.push({ itemId, itemType });

              }

            }

            publishLiveInsights();

          },

          () => {

            // Engagement metrics unavailable without Admin SDK or super-admin read access.

          }

        )

      );

    }



    async function loadInsightsFromApi() {

      try {

        const currentUser = firebaseAuth.currentUser;

        if (!currentUser) {

          if (!cancelled) {

            setInsightsLoading(false);

          }

          return;

        }



        const token = await currentUser.getIdToken();

        const params = new URLSearchParams();

        if (churchScope && MULTI_CHURCH_ENABLED) {

          params.set("churchId", churchScope);

        }



        const response = await fetch(

          `/api/admin/analytics/insights?${params.toString()}`,

          {

            headers: {

              Authorization: `Bearer ${token}`,

            },

          }

        );



        if (response.status === 503) {

          if (!cancelled) {

            setAdminSdkUnavailable(true);

            if (apiActive) {

              startClientFallback(isSuperAdmin);

            } else if (!cancelled) {

              setInsightsLoading(false);

            }

          }

          return;

        }



        if (!response.ok) {

          if (!cancelled && apiActive) {

            startClientFallback(isSuperAdmin);

          }

          return;

        }



        const payload = (await response.json()) as AdminAnalyticsInsightsResponse;

        if (!cancelled) {

          setUsingInsightsApi(true);

          setAdminSdkUnavailable(false);

          applyInsightsPayload(payload);

        }

      } catch {

        if (!cancelled && apiActive) {

          startClientFallback(isSuperAdmin);

        }

      }

    }



    void loadInsightsFromApi();

    const interval = window.setInterval(() => {

      if (apiActive) {

        void loadInsightsFromApi();

      }

    }, 60_000);



    return () => {

      cancelled = true;

      window.clearInterval(interval);

      clientUnsubscribes.forEach((unsubscribe) => unsubscribe());

    };

  }, [articleItems, churchScope, isSuperAdmin, sermonItems, songItems]);



  const completedDonations = useMemo(

    () => donations.filter((donation) => donation.paymentStatus === "completed"),

    [donations]

  );



  const monthlyDonations = useMemo(

    () => aggregateMonthlyDonations(completedDonations),

    [completedDonations]

  );



  const contentGrowth = useMemo(

    () => aggregateContentGrowth(songs, sermons, articles),

    [songs, sermons, articles]

  );



  const recentDonations = useMemo(

    () => [...donations].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8),

    [donations]

  );



  const scopeLabel = !MULTI_CHURCH_ENABLED

    ? "Platform-wide"

    : isSuperAdmin

      ? "Platform-wide"

      : churchScope

        ? "Church scope"

        : "No church selected";



  return {

    loading,

    insightsLoading,

    adminSdkUnavailable,

    counts: {

      songs: songs.length,

      sermons: sermons.length,

      articles: articles.length,

      prayerRequests: prayerRequests.length,

      events: events.length,

      donations: completedDonations.length,

      users: userCount,

    },

    topFavoritedSong,

    topViewedSermon,

    topReadArticle,

    recentUsers,

    recentDonations,

    monthlyDonations,

    contentGrowth,

    scopeLabel,

    usingInsightsApi,

  };

}


