"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import type { FirebaseSong } from "@/types/firebase-song";

import {
  FirebaseSongCard,
  songsAlbumGridClassName,
} from "@/components/music/firebase-song-card";
import { TabEmptyState } from "@/components/worship/songs-tab-content";
import { Button } from "@/components/ui/button";
import { useRealtimeSongs } from "@/hooks/use-worship-realtime";
import { filterPublishedSongs, sortSongsByLatest } from "@/lib/song-firestore";

type HomeSongsSectionProps = {
  initialSongs: FirebaseSong[];
};

export function HomeSongsSection({ initialSongs }: HomeSongsSectionProps) {
  const liveSongs = useRealtimeSongs(initialSongs);
  const songs = useMemo(
    () => sortSongsByLatest(filterPublishedSongs(liveSongs)),
    [liveSongs]
  );

  const loading = songs.length === 0 && initialSongs.length === 0;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
            Worship Collection
          </p>
          <h2 className="font-heading text-xl font-bold sm:text-2xl">Songs</h2>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
          <Link href="/songs">
            View All Songs
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>

      {loading ?
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/50 py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      : songs.length === 0 ?
        <TabEmptyState message="No songs available yet. Check back soon." />
      : <div className={songsAlbumGridClassName}>
          {songs.map((song) => (
            <FirebaseSongCard key={song.id} song={song} />
          ))}
        </div>
      }
    </section>
  );
}
