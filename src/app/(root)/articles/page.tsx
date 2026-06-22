import type { Metadata } from "next";

import { ArticlesTabContent } from "@/components/worship/articles-tab-content";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedArticlesCached } from "@/lib/cached-worship-data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Christian Articles & Resources",
  description:
    "Read faith-building Christian articles and devotional resources on FaithConnectHub for daily encouragement and spiritual growth.",
  path: "/articles",
  keywords: ["Christian articles", "devotional reading", "faith resources", "biblical articles"],
});

export default async function ArticlesPage() {
  const { churchId } = await getPageChurchContext();
  const articles = await getPublishedArticlesCached(churchId);

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8"
      aria-labelledby="articles-heading"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Reading
        </p>
        <h1 id="articles-heading" className="font-heading text-2xl font-bold sm:text-3xl">
          Articles
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Devotional articles and reflections for daily encouragement.
        </p>
      </header>

      <ArticlesTabContent initialArticles={articles} />
    </section>
  );
}
