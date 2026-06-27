"use client";

import { useEffect, useMemo, useState } from "react";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseFavorite } from "@/types/firebase-favorite";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import { getFirestoreDocsByIds } from "@/lib/firestore-batch-get";
import { normalizeSermonFromFirestore } from "@/lib/sermon-firestore";
import { filterPublishedSongs, normalizeSongFromFirestore } from "@/lib/song-firestore";

type ResolvedFavoriteItems = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
  loading: boolean;
  error: string | null;
};

export function useResolvedFavoriteItems(
  favorites: FirebaseFavorite[]
): ResolvedFavoriteItems {
  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [sermons, setSermons] = useState<FirebaseSermon[]>([]);
  const [articles, setArticles] = useState<FirebaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

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
      } catch {
        if (!cancelled) {
          setError("Unable to load favorites. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [favoriteKey, favorites]);

  return { songs, sermons, articles, loading, error };
}

async function loadSongs(favorites: FirebaseFavorite[]): Promise<FirebaseSong[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "song")
    .map((favorite) => favorite.itemId);

  const songs = await getFirestoreDocsByIds("songs", ids, normalizeSongFromFirestore);
  return filterPublishedSongs(songs);
}

async function loadSermons(
  favorites: FirebaseFavorite[]
): Promise<FirebaseSermon[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "sermon")
    .map((favorite) => favorite.itemId);

  const sermons = await getFirestoreDocsByIds(
    "sermons",
    ids,
    normalizeSermonFromFirestore
  );

  return sermons.filter((sermon) => sermon.isPublished);
}

async function loadArticles(
  favorites: FirebaseFavorite[]
): Promise<FirebaseArticle[]> {
  const ids = favorites
    .filter((favorite) => favorite.itemType === "article")
    .map((favorite) => favorite.itemId);

  const articles = await getFirestoreDocsByIds(
    "articles",
    ids,
    normalizeArticleFromFirestore
  );

  return articles.filter((article) => article.isPublished);
}
