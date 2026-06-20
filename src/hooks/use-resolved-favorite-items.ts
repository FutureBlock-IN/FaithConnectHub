"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseFavorite } from "@/types/firebase-favorite";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import { db } from "@/lib/firebase";
import { normalizeSermonFromFirestore } from "@/lib/sermon-firestore";
import { filterPublishedSongs, normalizeSongFromFirestore } from "@/lib/song-firestore";

type ResolvedFavoriteItems = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
  loading: boolean;
};

export function useResolvedFavoriteItems(
  favorites: FirebaseFavorite[]
): ResolvedFavoriteItems {
  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [sermons, setSermons] = useState<FirebaseSermon[]>([]);
  const [articles, setArticles] = useState<FirebaseArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const favoriteKey = useMemo(
    () =>
      favorites
        .map((favorite) => `${favorite.itemType}:${favorite.itemId}`)
        .join("|"),
    [favorites]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      if (favorites.length === 0) {
        setSongs([]);
        setSermons([]);
        setArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [nextSongs, nextSermons, nextArticles] = await Promise.all([
          loadSongs(favorites),
          loadSermons(favorites),
          loadArticles(favorites),
        ]);

        if (cancelled) return;

        setSongs(nextSongs);
        setSermons(nextSermons);
        setArticles(nextArticles);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [favoriteKey, favorites]);

  return { songs, sermons, articles, loading };
}

async function loadSongs(favorites: FirebaseFavorite[]): Promise<FirebaseSong[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "song")
    .map((favorite) => favorite.itemId);

  const songs = await Promise.all(
    ids.map(async (id) => {
      const snapshot = await getDoc(doc(db, "songs", id));
      if (!snapshot.exists()) return null;
      return normalizeSongFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
    })
  );

  return filterPublishedSongs(
    songs.filter((song): song is FirebaseSong => song !== null)
  );
}

async function loadSermons(
  favorites: FirebaseFavorite[]
): Promise<FirebaseSermon[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "sermon")
    .map((favorite) => favorite.itemId);

  const sermons = await Promise.all(
    ids.map(async (id) => {
      const snapshot = await getDoc(doc(db, "sermons", id));
      if (!snapshot.exists()) return null;
      const sermon = normalizeSermonFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return sermon.isPublished ? sermon : null;
    })
  );

  return sermons.filter((sermon): sermon is FirebaseSermon => sermon !== null);
}

async function loadArticles(
  favorites: FirebaseFavorite[]
): Promise<FirebaseArticle[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "article")
    .map((favorite) => favorite.itemId);

  const articles = await Promise.all(
    ids.map(async (id) => {
      const snapshot = await getDoc(doc(db, "articles", id));
      if (!snapshot.exists()) return null;
      const article = normalizeArticleFromFirestore(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return article.isPublished ? article : null;
    })
  );

  return articles.filter(
    (article): article is FirebaseArticle => article !== null
  );
}
