import { SermonsTabContent } from "@/components/worship/sermons-tab-content";
import { siteConfig } from "@/config/site";
import { getPublishedSermonsCached } from "@/lib/cached-worship-data";

export const revalidate = 60;

export const metadata = {
  title: "Sermons",
  description: `Watch and read sermons from ${siteConfig.name}.`,
};

export default async function SermonsPage() {
  const sermons = await getPublishedSermonsCached();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Teaching
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Sermons</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Messages to strengthen your faith and deepen your walk with God.
        </p>
      </div>

      <SermonsTabContent initialSermons={sermons} />
    </div>
  );
}
