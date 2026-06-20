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

export const getPublishedSongsCached = cache(async (churchId: string) => {
  return unstable_cache(
    async (): Promise<FirebaseSong[]> => {
      const songs = await getPublishedSongs(churchId);
      return songs.map(toSongListItem);
    },
    ["worship-published-songs", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["worship-songs", `church-${churchId}`] }
  )();
});

export const getPublishedSermonsCached = cache(async (churchId: string) => {
  return unstable_cache(
    async (): Promise<FirebaseSermon[]> => {
      const sermons = await getPublishedSermons(churchId);
      return sermons.map(toSermonListItem);
    },
    ["worship-published-sermons", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["worship-sermons", `church-${churchId}`] }
  )();
});

export const getPublishedArticlesCached = cache(async (churchId: string) => {
  return unstable_cache(
    async (): Promise<FirebaseArticle[]> => {
      const articles = await getPublishedArticles(churchId);
      return articles.map(toArticleListItem);
    },
    ["worship-published-articles", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["worship-articles", `church-${churchId}`] }
  )();
});

export const getSongByIdCached = cache(async (churchId: string, songId: string) => {
  return unstable_cache(
    async () => {
      const song = await getSongById(songId);
      if (!song || song.churchId !== churchId) return null;
      return song;
    },
    ["worship-song-by-id", churchId, songId],
    { revalidate: REVALIDATE_SECONDS, tags: [`worship-song-${songId}`, `church-${churchId}`] }
  )();
});

export const getSermonByIdCached = cache(
  async (churchId: string, sermonId: string) => {
    return unstable_cache(
      async () => {
        const sermon = await getSermonById(sermonId);
        if (!sermon || sermon.churchId !== churchId) return null;
        return sermon;
      },
      ["worship-sermon-by-id", churchId, sermonId],
      {
        revalidate: REVALIDATE_SECONDS,
        tags: [`worship-sermon-${sermonId}`, `church-${churchId}`],
      }
    )();
  }
);

export const getArticleByIdCached = cache(
  async (churchId: string, articleId: string) => {
    return unstable_cache(
      async () => {
        const article = await getArticleById(articleId);
        if (!article || article.churchId !== churchId) return null;
        return article;
      },
      ["worship-article-by-id", churchId, articleId],
      {
        revalidate: REVALIDATE_SECONDS,
        tags: [`worship-article-${articleId}`, `church-${churchId}`],
      }
    )();
  }
);

export type WorshipCatalog = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
};

export const getWorshipCatalogCached = cache(
  async (churchId: string): Promise<WorshipCatalog> => {
    const [songs, sermons, articles] = await Promise.all([
      getPublishedSongsCached(churchId),
      getPublishedSermonsCached(churchId),
      getPublishedArticlesCached(churchId),
    ]);
    return { songs, sermons, articles };
  }
);
