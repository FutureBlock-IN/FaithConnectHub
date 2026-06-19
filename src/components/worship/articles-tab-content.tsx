"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import type { FirebaseArticle } from "@/types/firebase-article";

import { FirebaseArticleCard } from "@/components/worship/firebase-article-card";
import { CollectionTabHeader } from "@/components/worship/collection-tab-header";
import { worshipContentGridClassName } from "@/components/worship/worship-card-styles";
import { TabEmptyState, TabLoadingState } from "@/components/worship/songs-tab-content";
import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import { db } from "@/lib/firebase";

type ArticlesTabContentProps = {
  initialArticles: FirebaseArticle[];
};

export function ArticlesTabContent({
  initialArticles,
}: ArticlesTabContentProps) {
  const [articles, setArticles] = useState<FirebaseArticle[]>(initialArticles);
  const [loading, setLoading] = useState(!initialArticles.length);

  useEffect(() => {
    const articlesQuery = query(
      collection(db, "articles"),
      orderBy("dateCreated", "desc")
    );

    const unsubscribe = onSnapshot(
      articlesQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) =>
            normalizeArticleFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
          .filter((a) => a.isPublished);
        setArticles(items);
        setLoading(false);
      },
      (error) => {
        console.error("[ArticlesTabContent] Firestore snapshot failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <TabLoadingState label="Loading articles..." />;
  }

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
