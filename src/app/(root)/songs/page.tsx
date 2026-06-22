import type { Metadata } from "next";

import { SongsTabContent } from "@/components/worship/songs-tab-content";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedSongsCached } from "@/lib/cached-worship-data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Worship Songs & Lyrics",
  description:
    "Browse Christian worship songs and lyrics on FaithConnectHub. Listen, sing, and grow in faith with Telugu and English worship music.",
  path: "/songs",
  keywords: [
    "worship songs",
    "Christian lyrics",
    "Telugu worship songs",
    "English worship songs",
    "worship music",
  ],
});

export default async function SongsPage() {
  const { churchId } = await getPageChurchContext();
  const songs = await getPublishedSongsCached(churchId);

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8"
      aria-labelledby="songs-heading"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Worship Collection
        </p>
        <h1 id="songs-heading" className="font-heading text-2xl font-bold sm:text-3xl">
          Songs
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Listen to Christian worship music and read Telugu and English lyrics.
        </p>
      </header>

      <SongsTabContent initialSongs={songs} />
    </section>
  );
}
