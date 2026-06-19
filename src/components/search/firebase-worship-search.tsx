"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";
import { searchArticles } from "@/lib/firebase-article-queries";
import { searchSermons } from "@/lib/firebase-sermon-queries";
import { searchSongs } from "@/lib/firebase-queries";
import { getContentTypeLabel } from "@/lib/worship-collection";

import { SearchResultRow } from "./search-result-row";

type FirebaseWorshipSearchProps = {
  query: string;
};

function getSermonSubtitle(sermon: FirebaseSermon): string | undefined {
  return sermon.shortDescription?.trim() || sermon.subtitle?.trim() || undefined;
}

export function FirebaseWorshipSearch({ query }: FirebaseWorshipSearchProps) {
  const { activeTab } = useEffectiveWorshipCollectionTab();
  const [songs, setSongs] = React.useState<FirebaseSong[]>([]);
  const [sermons, setSermons] = React.useState<FirebaseSermon[]>([]);
  const [articles, setArticles] = React.useState<FirebaseArticle[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (!query.trim()) {
        setSongs([]);
        setSermons([]);
        setArticles([]);
        return;
      }

      setLoading(true);
      try {
        if (activeTab === "songs") {
          setSermons([]);
          setArticles([]);
          setSongs(await searchSongs(query));
        } else if (activeTab === "sermons") {
          setSongs([]);
          setArticles([]);
          setSermons(await searchSermons(query));
        } else {
          setSongs([]);
          setSermons([]);
          setArticles(await searchArticles(query));
        }
      } catch {
        setSongs([]);
        setSermons([]);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, activeTab]);

  if (!query.trim()) return null;

  if (loading) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground">
        <Loader2 className="mr-2 inline-block size-4 animate-spin" />
        Searching {activeTab}...
      </div>
    );
  }

  const hasResults =
    activeTab === "songs"
      ? songs.length > 0
      : activeTab === "sermons"
        ? sermons.length > 0
        : articles.length > 0;

  if (!hasResults) {
    const emptyMessage =
      activeTab === "songs"
        ? "No Songs Found"
        : activeTab === "sermons"
          ? "No Sermons Found"
          : "No Articles Found";

    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const sectionLabel = getContentTypeLabel(activeTab);

  return (
    <div className="w-full space-y-3 py-4">
      <p className="font-heading text-lg font-semibold">{sectionLabel}</p>

      <div className="flex max-h-96 w-full flex-col gap-2 overflow-y-auto pr-2">
        {activeTab === "songs" &&
          songs.map((song) => (
            <SearchResultRow
              key={song.id}
              href={`/songs/${encodeURIComponent(song.id)}`}
              title={song.englishTitle ?? song.title ?? ""}
              subtitle={song.teluguTitle}
              coverUrl={song.imageUrl}
            />
          ))}

        {activeTab === "sermons" &&
          sermons.map((sermon) => (
            <SearchResultRow
              key={sermon.id}
              href={`/sermons/${encodeURIComponent(sermon.id)}`}
              title={sermon.title}
              subtitle={getSermonSubtitle(sermon)}
              coverUrl={sermon.coverImage}
            />
          ))}

        {activeTab === "articles" &&
          articles.map((article) => (
            <SearchResultRow
              key={article.id}
              href={`/articles/${encodeURIComponent(article.id)}`}
              title={article.title}
              subtitle={article.shortDescription}
              coverUrl={article.coverImage}
            />
          ))}
      </div>
    </div>
  );
}
