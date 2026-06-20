"use client";

import { useMemo } from "react";

import { useWorshipCatalog } from "@/context/worship-catalog-context";
import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";
import {
  filterArticlesLocal,
  filterSermonsLocal,
  filterSongsLocal,
} from "@/lib/worship-search-utils";

import { SearchResultRow } from "./search-result-row";
import { buildWorshipSearchResults } from "./worship-search-result-list";

type FirebaseWorshipSearchProps = {
  query: string;
};

export function FirebaseWorshipSearch({ query }: FirebaseWorshipSearchProps) {
  const catalog = useWorshipCatalog();
  const { activeTab } = useEffectiveWorshipCollectionTab();

  const songs = useMemo(
    () => (catalog ? filterSongsLocal(catalog.songs, query) : []),
    [catalog, query]
  );
  const sermons = useMemo(
    () => (catalog ? filterSermonsLocal(catalog.sermons, query) : []),
    [catalog, query]
  );
  const articles = useMemo(
    () => (catalog ? filterArticlesLocal(catalog.articles, query) : []),
    [catalog, query]
  );

  const results = useMemo(
    () =>
      buildWorshipSearchResults({
        activeTab,
        songs,
        sermons,
        articles,
      }),
    [activeTab, songs, sermons, articles]
  );

  if (!query.trim()) return null;

  if (!catalog) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground">
        Search is loading...
      </div>
    );
  }

  if (results.length === 0) {
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

  const sectionLabel =
    activeTab === "songs"
      ? "Songs"
      : activeTab === "sermons"
        ? "Sermons"
        : "Articles";

  return (
    <div className="w-full space-y-3 py-4">
      <p className="font-heading text-lg font-semibold">{sectionLabel}</p>
      <div className="flex max-h-96 w-full flex-col gap-2 overflow-y-auto pr-2">
        {results.map((result) => (
          <SearchResultRow
            key={result.key}
            href={result.href}
            title={result.title}
            subtitle={result.subtitle}
            coverUrl={result.coverUrl}
          />
        ))}
      </div>
    </div>
  );
}
