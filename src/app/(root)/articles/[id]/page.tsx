import { notFound } from "next/navigation";

import { ContentAuthRequired } from "@/components/auth/content-auth-required";
import { ArticleDetailView } from "@/components/articles/article-detail-view";
import { DEFAULT_SONG_COVER, siteConfig } from "@/config/site";
import { isAuthenticatedServer } from "@/lib/auth-server";
import {
  getArticleNeighbors,
  getRelatedArticles,
} from "@/lib/article-utils";
import {
  getArticleByIdCached,
  getPublishedArticlesCached,
} from "@/lib/cached-worship-data";
import { getSongCoverUrl } from "@/lib/utils";

export const revalidate = 60;

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleByIdCached(decodeURIComponent(id));

  if (!article || !article.isPublished) {
    return { title: "Article Not Found" };
  }

  const coverUrl =
    getSongCoverUrl(article.coverImage) || `${siteConfig.url}${DEFAULT_SONG_COVER}`;

  return {
    title: `${article.title} | ${siteConfig.name}`,
    description: article.shortDescription,
    openGraph: {
      title: article.title,
      description: article.shortDescription,
      type: "article",
      images: [{ url: coverUrl, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const callbackPath = `/articles/${encodeURIComponent(decodedId)}`;
  const isAuthenticated = await isAuthenticatedServer();

  if (!isAuthenticated) {
    return <ContentAuthRequired callbackPath={callbackPath} />;
  }

  const [article, allPublished] = await Promise.all([
    getArticleByIdCached(decodedId),
    getPublishedArticlesCached(),
  ]);

  if (!article || !article.isPublished) {
    notFound();
  }

  const { previous, next } = getArticleNeighbors(allPublished, article.id);
  const relatedArticles = getRelatedArticles(allPublished, article.id, 3);

  return (
    <ArticleDetailView
      article={article}
      relatedArticles={relatedArticles}
      previousArticle={previous}
      nextArticle={next}
    />
  );
}
