"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import type { FirebaseSong } from "@/types/firebase-song";

import { FirebaseSongCard } from "@/components/music/firebase-song-card";
import { db } from "@/lib/firebase";

type SongsTabContentProps = {
  initialSongs: FirebaseSong[];
};

function normalizeSongData(
  id: string,
  data: Record<string, unknown>
): FirebaseSong {
  const createdAtValue = data.createdAt as unknown;
  const createdAt =
    createdAtValue &&
    typeof createdAtValue === "object" &&
    typeof (createdAtValue as { toMillis(): number }).toMillis === "function"
      ? (createdAtValue as { toMillis(): number }).toMillis()
      : typeof createdAtValue === "number"
        ? createdAtValue
        : Date.now();

  return {
    id,
    title: String(data.title ?? ""),
    englishTitle: String(data.englishTitle ?? "").trim() || undefined,
    teluguTitle: String(data.teluguTitle ?? "").trim() || undefined,
    lyrics: String(data.lyrics ?? data.teluguLyrics ?? ""),
    transliteratedLyrics: String(
      data.transliteratedLyrics ?? data.englishLyrics ?? ""
    ),
    imageUrl: String(data.imageUrl ?? data.coverImageUrl ?? "") || undefined,
    audioUrl: String(data.audioUrl ?? data.audioFileUrl ?? "") || undefined,
    youtubeUrl: String(data.youtubeUrl ?? data.videoUrl ?? "") || undefined,
    playCount: typeof data.playCount === "number" ? data.playCount : 0,
    createdAt,
  };
}

export function SongsTabContent({ initialSongs }: SongsTabContentProps) {
  const [songs, setSongs] = useState<FirebaseSong[]>(initialSongs);
  const [loading, setLoading] = useState(!initialSongs.length);

  useEffect(() => {
    const songsQuery = query(
      collection(db, "songs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      songsQuery,
      (snapshot) => {
        setSongs(
          snapshot.docs.map((docSnap) =>
            normalizeSongData(docSnap.id, docSnap.data() as Record<string, unknown>)
          )
        );
        setLoading(false);
      },
      (error) => {
        console.error("[SongsTabContent] Firestore snapshot failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <TabLoadingState label="Loading songs..." />;
  }

  if (songs.length === 0) {
    return <TabEmptyState message="No Songs Found" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {songs.map((song) => (
        <FirebaseSongCard key={song.id} song={song} />
      ))}
    </div>
  );
}

export function TabLoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 py-16 text-center">
      <Loader2 className="mb-3 size-8 animate-spin text-primary/60" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function TabEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
