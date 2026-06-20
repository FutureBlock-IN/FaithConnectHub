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

export function useRealtimeSongs(initialSongs: FirebaseSong[]) {
  const [songs, setSongs] = useState(initialSongs);

  useEffect(() => {
    const songsQuery = query(
      collection(db, "songs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(songsQuery, (snapshot) => {
      setSongs(
        snapshot.docs.map((docSnap) =>
          normalizeSongFromFirestore(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        )
      );
    });

    return unsubscribe;
  }, []);

  return songs;
}

export function useRealtimeSermons(initialSermons: FirebaseSermon[]) {
  const [sermons, setSermons] = useState(initialSermons);

  useEffect(() => {
    const snapshots: Record<string, FirebaseSermon[]> = {};

    function publishMerged() {
      setSermons(mergeSermonsById(Object.values(snapshots)));
    }

    const unsubscribes = [SERMONS_COLLECTION, LEGACY_SERMONS_COLLECTION].map(
      (collectionName) => {
        const sermonsQuery = query(
          collection(db, collectionName),
          orderBy("dateCreated", "desc")
        );

        return onSnapshot(sermonsQuery, (snapshot) => {
          snapshots[collectionName] = snapshot.docs.map((docSnap) =>
            normalizeSermonFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          );
          publishMerged();
        });
      }
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  return sermons;
}

export function useRealtimeArticles(initialArticles: FirebaseArticle[]) {
  const [articles, setArticles] = useState(initialArticles);

  useEffect(() => {
    const articlesQuery = query(
      collection(db, "articles"),
      orderBy("dateCreated", "desc")
    );

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      setArticles(
        snapshot.docs.map((docSnap) =>
          normalizeArticleFromFirestore(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        )
      );
    });

    return unsubscribe;
  }, []);

  return articles;
}
