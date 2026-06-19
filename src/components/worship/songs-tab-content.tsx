"use client";

import React, { useMemo } from "react";

import type { FirebaseSong } from "@/types/firebase-song";

import {
  FirebaseSongCard,
  songsAlbumGridClassName,
} from "@/components/music/firebase-song-card";
import { SongsTabHeader } from "@/components/worship/songs-tab-header";
import { filterPublishedSongs } from "@/lib/song-firestore";

type SongsTabContentProps = {
  initialSongs: FirebaseSong[];
};

export function SongsTabContent({ initialSongs }: SongsTabContentProps) {
  const visibleSongs = useMemo(
    () => filterPublishedSongs(initialSongs),
    [initialSongs]
  );

  if (visibleSongs.length === 0) {
    return <TabEmptyState message="No songs available yet." />;
  }

  return (
    <>
      <SongsTabHeader count={visibleSongs.length} />
      <div className={songsAlbumGridClassName}>
        {visibleSongs.map((song) => (
          <FirebaseSongCard key={song.id} song={song} />
        ))}
      </div>
    </>
  );
}

export function TabEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
