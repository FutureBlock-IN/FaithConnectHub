import { ArticlesTabContent } from "@/components/worship/articles-tab-content";
import { siteConfig } from "@/config/site";
import { getPublishedArticlesCached } from "@/lib/cached-worship-data";

export const revalidate = 60;

export const metadata = {
  title: "Articles",
  description: `Read faith-building articles from ${siteConfig.name}.`,
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticlesCached();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Reading
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Articles</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Devotional articles and reflections for daily encouragement.
        </p>
      </div>

      <ArticlesTabContent initialArticles={articles} />
    </div>
  );
}
