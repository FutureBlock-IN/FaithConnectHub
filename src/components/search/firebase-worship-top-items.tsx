"use client";

import React from "react";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";

import { getSongAlternateTitle, getSongDisplayTitle } from "@/lib/song-firestore";

import { SearchResultRow } from "./search-result-row";

type WorshipTopItemsClientProps = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
};

function getSermonSubtitle(sermon: FirebaseSermon): string | undefined {
  return sermon.shortDescription?.trim() || sermon.subtitle?.trim() || undefined;
}

export function WorshipTopItemsClient({
  songs,
  sermons,
  articles,
}: WorshipTopItemsClientProps) {
  const { activeTab } = useEffectiveWorshipCollectionTab();

  const sectionLabel =
    activeTab === "songs"
      ? "Popular Songs"
      : activeTab === "sermons"
        ? "Recent Sermons"
        : "Recent Articles";

  const hasItems =
    activeTab === "songs"
      ? songs.length > 0
      : activeTab === "sermons"
        ? sermons.length > 0
        : articles.length > 0;

  if (!hasItems) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground">
        {activeTab === "songs"
          ? "No songs yet"
          : activeTab === "sermons"
            ? "No sermons yet"
            : "No articles yet"}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 py-4">
      <p className="font-heading text-lg font-semibold">{sectionLabel}</p>
      <div className="flex max-h-96 w-full flex-col gap-2 overflow-y-auto pr-2">
        {activeTab === "songs" &&
          songs.map((song) => (
            <SearchResultRow
              key={song.id}
              href={`/songs/${encodeURIComponent(song.id)}`}
              title={getSongDisplayTitle(song)}
              subtitle={getSongAlternateTitle(song)}
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
