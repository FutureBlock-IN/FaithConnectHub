import { SongsTabContent } from "@/components/worship/songs-tab-content";
import { siteConfig } from "@/config/site";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getPublishedSongsCached } from "@/lib/cached-worship-data";

export const revalidate = 60;

export const metadata = {
  title: "Songs",
  description: `Browse Christian worship songs and lyrics on ${siteConfig.name}.`,
};

export default async function SongsPage() {
  const { churchId } = await getPageChurchContext();
  const songs = await getPublishedSongsCached(churchId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Worship Collection
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Songs</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Listen to Christian worship music and read Telugu and English lyrics.
        </p>
      </div>

      <SongsTabContent initialSongs={songs} />
    </div>
  );
}
