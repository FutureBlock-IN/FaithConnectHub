"use client";

import React, { useMemo } from "react";

import type { FirebaseArticle } from "@/types/firebase-article";

import { FirebaseArticleCard } from "@/components/worship/firebase-article-card";
import { CollectionTabHeader } from "@/components/worship/collection-tab-header";
import { worshipContentGridClassName } from "@/components/worship/worship-card-styles";
import { TabEmptyState } from "@/components/worship/songs-tab-content";
import { useRealtimeArticles } from "@/hooks/use-worship-realtime";

type ArticlesTabContentProps = {
  initialArticles: FirebaseArticle[];
};

export function ArticlesTabContent({
  initialArticles,
}: ArticlesTabContentProps) {
  const liveArticles = useRealtimeArticles(initialArticles);
  const articles = useMemo(
    () => liveArticles.filter((article) => article.isPublished),
    [liveArticles]
  );

  if (articles.length === 0) {
    return <TabEmptyState message="No Articles Found" />;
  }

  return (
    <>
      <CollectionTabHeader title="Articles" count={articles.length} />
      <div className={worshipContentGridClassName}>
        {articles.map((article) => (
          <FirebaseArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
