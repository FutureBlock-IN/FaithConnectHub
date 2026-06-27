"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import { db } from "@/lib/firebase";
import {
  LEGACY_SERMONS_COLLECTION,
  mergeSermonsById,
  normalizeSermonFromFirestore,
  SERMONS_COLLECTION,
} from "@/lib/sermon-firestore";
import { normalizeSongFromFirestore } from "@/lib/song-firestore";

export type RealtimeCollectionState<T> = {
  data: T[];
  syncing: boolean;
};

export function useRealtimeSongs(
  initialSongs: FirebaseSong[]
): RealtimeCollectionState<FirebaseSong> {
  const [data, setData] = useState(initialSongs);
  const [syncing, setSyncing] = useState(initialSongs.length === 0);

  useEffect(() => {
    setData(initialSongs);
    if (initialSongs.length > 0) {
      setSyncing(false);
    }
  }, [initialSongs]);

  useEffect(() => {
    const songsQuery = query(
      collection(db, "songs"),
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
        setSyncing(false);
      },
      () => {
        setSyncing(false);
      }
    );

    return unsubscribe;
  }, []);

  return { data, syncing };
}

export function useRealtimeSermons(
  initialSermons: FirebaseSermon[]
): RealtimeCollectionState<FirebaseSermon> {
  const [data, setData] = useState(initialSermons);
  const [syncing, setSyncing] = useState(initialSermons.length === 0);

  useEffect(() => {
    setData(initialSermons);
    if (initialSermons.length > 0) {
      setSyncing(false);
    }
  }, [initialSermons]);

  useEffect(() => {
    const snapshots: Record<string, FirebaseSermon[]> = {};

    function publishMerged() {
      setData(mergeSermonsById(Object.values(snapshots)));
      setSyncing(false);
    }

    const unsubscribes = [SERMONS_COLLECTION, LEGACY_SERMONS_COLLECTION].map(
      (collectionName) => {
        const sermonsQuery = query(
          collection(db, collectionName),
          orderBy("dateCreated", "desc")
        );

        return onSnapshot(
          sermonsQuery,
          (snapshot) => {
            snapshots[collectionName] = snapshot.docs.map((docSnap) =>
              normalizeSermonFromFirestore(
                docSnap.id,
                docSnap.data() as Record<string, unknown>
              )
            );
            publishMerged();
          },
          () => {
            setSyncing(false);
          }
        );
      }
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  return { data, syncing };
}

export function useRealtimeArticles(
  initialArticles: FirebaseArticle[]
): RealtimeCollectionState<FirebaseArticle> {
  const [data, setData] = useState(initialArticles);
  const [syncing, setSyncing] = useState(initialArticles.length === 0);

  useEffect(() => {
    setData(initialArticles);
    if (initialArticles.length > 0) {
      setSyncing(false);
    }
  }, [initialArticles]);

  useEffect(() => {
    const articlesQuery = query(
      collection(db, "articles"),
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
        setSyncing(false);
      },
      () => {
        setSyncing(false);
      }
    );

    return unsubscribe;
  }, []);

  return { data, syncing };
}
