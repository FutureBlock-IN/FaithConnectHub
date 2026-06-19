import { cache } from "react";
import { unstable_cache } from "next/cache";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { getArticleById, getPublishedArticles } from "./firebase-article-queries";
import { getSermonById, getPublishedSermons } from "./firebase-sermon-queries";
import { getPublishedSongs, getSongById } from "./firebase-queries";
import { toArticleListItem } from "./article-firestore";
import { toSermonListItem } from "./sermon-firestore";
import { toSongListItem } from "./song-firestore";

const REVALIDATE_SECONDS = 60;

const cachedPublishedSongs = unstable_cache(
  async (): Promise<FirebaseSong[]> => {
    const songs = await getPublishedSongs();
    return songs.map(toSongListItem);
  },
  ["worship-published-songs"],
  { revalidate: REVALIDATE_SECONDS, tags: ["worship-songs"] }
);

const cachedPublishedSermons = unstable_cache(
  async (): Promise<FirebaseSermon[]> => {
    const sermons = await getPublishedSermons();
    return sermons.map(toSermonListItem);
  },
  ["worship-published-sermons"],
  { revalidate: REVALIDATE_SECONDS, tags: ["worship-sermons"] }
);

const cachedPublishedArticles = unstable_cache(
  async (): Promise<FirebaseArticle[]> => {
    const articles = await getPublishedArticles();
    return articles.map(toArticleListItem);
  },
  ["worship-published-articles"],
  { revalidate: REVALIDATE_SECONDS, tags: ["worship-articles"] }
);

export const getPublishedSongsCached = cache(cachedPublishedSongs);
export const getPublishedSermonsCached = cache(cachedPublishedSermons);
export const getPublishedArticlesCached = cache(cachedPublishedArticles);

export const getSongByIdCached = cache(async (songId: string) => {
  return unstable_cache(
    async () => getSongById(songId),
    ["worship-song-by-id", songId],
    { revalidate: REVALIDATE_SECONDS, tags: [`worship-song-${songId}`] }
  )();
});

export const getSermonByIdCached = cache(async (sermonId: string) => {
  return unstable_cache(
    async () => getSermonById(sermonId),
    ["worship-sermon-by-id", sermonId],
    { revalidate: REVALIDATE_SECONDS, tags: [`worship-sermon-${sermonId}`] }
  )();
});

export const getArticleByIdCached = cache(async (articleId: string) => {
  return unstable_cache(
    async () => getArticleById(articleId),
    ["worship-article-by-id", articleId],
    { revalidate: REVALIDATE_SECONDS, tags: [`worship-article-${articleId}`] }
  )();
});

export type WorshipCatalog = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
};

export const getWorshipCatalogCached = cache(async (): Promise<WorshipCatalog> => {
  const [songs, sermons, articles] = await Promise.all([
    getPublishedSongsCached(),
    getPublishedSermonsCached(),
    getPublishedArticlesCached(),
  ]);
  return { songs, sermons, articles };
});
