import type { Metadata } from "next";

import { SermonsTabContent } from "@/components/worship/sermons-tab-content";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedSermonsCached } from "@/lib/cached-worship-data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Sermons & Biblical Teachings",
  description:
    "Watch and read sermons and biblical teachings on FaithConnectHub. Messages to strengthen faith and deepen your walk with God.",
  path: "/sermons",
  keywords: ["Christian sermons", "biblical teaching", "sermon archive", "faith messages"],
});

export default async function SermonsPage() {
  const { churchId } = await getPageChurchContext();
  const sermons = await getPublishedSermonsCached(churchId);

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8"
      aria-labelledby="sermons-heading"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Teaching
        </p>
        <h1 id="sermons-heading" className="font-heading text-2xl font-bold sm:text-3xl">
          Sermons
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Messages to strengthen your faith and deepen your walk with God.
        </p>
      </header>

      <SermonsTabContent initialSermons={sermons} />
    </section>
  );
}
