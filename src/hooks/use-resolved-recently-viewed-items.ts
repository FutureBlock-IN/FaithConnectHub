"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseRecentlyViewed } from "@/types/firebase-recently-viewed";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import { db } from "@/lib/firebase";
import { normalizeSermonFromFirestore } from "@/lib/sermon-firestore";
import {
  filterPublishedSongs,
  normalizeSongFromFirestore,
} from "@/lib/song-firestore";

export type ResolvedRecentlyViewedItem =
  | { itemType: "song"; item: FirebaseSong }
  | { itemType: "sermon"; item: FirebaseSermon }
  | { itemType: "article"; item: FirebaseArticle };

type ResolvedRecentlyViewedItems = {
  items: ResolvedRecentlyViewedItem[];
  loading: boolean;
};

export function useResolvedRecentlyViewedItems(
  recentlyViewed: FirebaseRecentlyViewed[]
): ResolvedRecentlyViewedItems {
  const [items, setItems] = useState<ResolvedRecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const recentlyViewedKey = useMemo(
    () =>
      recentlyViewed
        .map((entry) => `${entry.itemType}:${entry.itemId}:${entry.viewedAt}`)
        .join("|"),
    [recentlyViewed]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      if (recentlyViewed.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const resolved = await Promise.all(
          recentlyViewed.map((entry) => resolveRecentlyViewedEntry(entry))
        );

        if (cancelled) return;

        setItems(
          resolved.filter(
            (entry): entry is ResolvedRecentlyViewedItem => entry !== null
          )
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [recentlyViewedKey, recentlyViewed]);

  return { items, loading };
}

async function resolveRecentlyViewedEntry(
  entry: FirebaseRecentlyViewed
): Promise<ResolvedRecentlyViewedItem | null> {
  switch (entry.itemType) {
    case "song": {
      const snapshot = await getDoc(doc(db, "songs", entry.itemId));
      if (!snapshot.exists()) return null;
      const song = normalizeSongFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return filterPublishedSongs([song]).length > 0 ?
          { itemType: "song", item: song }
        : null;
    }
    case "sermon": {
      const snapshot = await getDoc(doc(db, "sermons", entry.itemId));
      if (!snapshot.exists()) return null;
      const sermon = normalizeSermonFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return sermon.isPublished ? { itemType: "sermon", item: sermon } : null;
    }
    case "article": {
      const snapshot = await getDoc(doc(db, "articles", entry.itemId));
      if (!snapshot.exists()) return null;
      const article = normalizeArticleFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return article.isPublished ?
          { itemType: "article", item: article }
        : null;
    }
  }
}
