 
"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Music2,
  Pause,
  Play,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSyncExternalStore } from "react";

import type { FirebaseSong } from "@/types/firebase-song";

import { FirebaseSongLyrics } from "@/components/music/firebase-song-lyrics";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaySong } from "@/hooks/use-play-song";
import {
  useCurrentSongIndex,
  useIsPlayerInit,
  useQueue,
} from "@/hooks/use-store";
import { getSongLyricsContent } from "@/lib/song-lyrics";
import { getSongCoverUrl, cn } from "@/lib/utils";
import { DEFAULT_SONG_COVER } from "@/config/site";
import { incrementPlayCount } from "@/lib/firebase-queries";
import {
  getSongAlternateTitle,
  getSongDisplayTitle,
} from "@/lib/song-firestore";
import {
  getPlaybackPlaying,
  subscribePlaybackPlaying,
  togglePlayback,
} from "@/lib/playback-bridge";
import { ShareSongButton } from "./share-song";

type SongDetailClientProps = {
  song: FirebaseSong;
};

const secondaryActionClass =
  "h-9 gap-1.5 rounded-full border border-white/15 bg-transparent px-4 text-sm font-medium text-[#b3b3b3] hover:border-white/40 hover:bg-white/5 hover:text-white";

function scrollToLyrics() {
  document.getElementById("song-lyrics")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SongDetailClient({ song }: SongDetailClientProps) {
  const [queue] = useQueue();
  const [, setQueue] = useQueue();
  const [currentIndex] = useCurrentSongIndex();
  const [, setCurrentIndex] = useCurrentSongIndex();
  const [, setIsPlayerInit] = useIsPlayerInit();
  const { playSong } = usePlaySong();
  const [showVideo, setShowVideo] = React.useState(false);

  const playing = useSyncExternalStore(
    subscribePlaybackPlaying,
    getPlaybackPlaying,
    () => false
  );

  const { english, translated, hasLyrics } = getSongLyricsContent(song);

  const audioUrl = song.audioUrl?.trim() ?? "";
  const coverUrl = getSongCoverUrl(song.imageUrl);
  const youtubeUrl = song.youtubeUrl?.trim() ?? "";

  const displayTitle = getSongDisplayTitle(song);
  const alternateTitle = getSongAlternateTitle(song) ?? "";
  const artistName =
    song.artist?.trim() ||
    (alternateTitle && alternateTitle !== displayTitle ? alternateTitle : "");
  const releaseYear =
    song.createdAt ? new Date(song.createdAt).getFullYear() : null;
  const metaLine = [song.category, releaseYear ? String(releaseYear) : null]
    .filter(Boolean)
    .join(" • ");

  const songIndex = queue.findIndex((item) => item.id === song.id);
  const isCurrentSong = songIndex === currentIndex && songIndex !== -1;
  const isPlaying = isCurrentSong && playing;

  function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    const id = idMatch ? idMatch[1] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  const embedSrc = getYouTubeEmbedUrl(youtubeUrl);

  React.useLayoutEffect(() => {
    incrementPlayCount(song.id);

    if (audioUrl) {
      setQueue([
        {
          id: song.id,
          name: displayTitle,
          subtitle: artistName,
          image: coverUrl,
          duration: 0,
          download_url: audioUrl,
          url: `/songs/${encodeURIComponent(song.id)}`,
          type: "song",
          artists: [],
        },
      ]);
      setCurrentIndex(0);
      setIsPlayerInit(true);
    } else {
      setQueue([]);
      setCurrentIndex(0);
      setIsPlayerInit(false);
    }
  }, [
    song.id,
    audioUrl,
    displayTitle,
    artistName,
    coverUrl,
    setQueue,
    setCurrentIndex,
    setIsPlayerInit,
  ]);

  function handlePlaySong() {
    if (!audioUrl) {
      toast.error("No audio available for this song");
      return;
    }

    if (isCurrentSong) {
      togglePlayback();
      return;
    }

    playSong(song);
  }


  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10">
      <div className="py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#727272] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Songs
        </Link>
      </div>

      {/* Centered hero */}
      <header className="mb-12 flex flex-col items-center text-center">
        <div className="relative mb-5 size-32 overflow-hidden rounded-md shadow-lg">
          <ImageWithFallback
            src={coverUrl}
            fallback={DEFAULT_SONG_COVER}
            width={128}
            height={128}
            sizes="128px"
            alt={displayTitle}
            className="size-full object-cover"
          />
          <Skeleton className="absolute inset-0 -z-10 size-full" />
        </div>

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#727272]">
          Worship Song
        </p>

        <h1 className="max-w-xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          {displayTitle}
        </h1>

        {artistName ?
          <p className="mt-3 max-w-lg text-base text-[#b3b3b3] sm:text-lg">
            {artistName}
          </p>
        : null}

        {metaLine ?
          <p className="mt-1.5 text-sm text-[#727272]">{metaLine}</p>
        : null}

        <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-4">
          {audioUrl ?
            <Button
              type="button"
              onClick={handlePlaySong}
              className="h-12 w-full max-w-xs gap-2.5 rounded-full bg-white px-8 text-base font-semibold text-black transition-transform hover:scale-[1.02] hover:bg-white/90"
            >
              {isPlaying ?
                <>
                  <Pause className="size-5 fill-black" />
                  Pause
                </>
              : <>
                  <Play className="size-5 translate-x-0.5 fill-black" />
                  Play Song
                </>
              }
            </Button>
          : null}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {hasLyrics ?
              <Button
                type="button"
                variant="ghost"
                className={secondaryActionClass}
                onClick={scrollToLyrics}
              >
                <Music2 className="size-3.5" />
                Lyrics
              </Button>
            : null}

            {youtubeUrl ?
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(secondaryActionClass, "inline-flex items-center")}
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
            : null}

            <ShareSongButton
              songId={song.id}
              songTitle={displayTitle}
              alternateTitle={alternateTitle}
              className={secondaryActionClass}
            />
          </div>
        </div>
      </header>

      {embedSrc && (
        <section className="mb-10">
          <button
            type="button"
            onClick={() => setShowVideo((s) => !s)}
            className="flex w-full items-center justify-between gap-3 py-2 text-sm font-medium text-[#727272] transition-colors hover:text-white"
          >
            <span className="flex items-center gap-2">
              <PlayCircle className="size-4 text-[#b3b3b3]" />
              {showVideo ? "Hide video" : "Watch song video"}
            </span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                showVideo && "rotate-180"
              )}
            />
          </button>
          {showVideo && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <div className="relative" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={embedSrc}
                  title={`YouTube video for ${displayTitle}`}
                  className="absolute inset-0 h-full w-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </section>
      )}

      <section id="song-lyrics" className="scroll-mt-24">
        {hasLyrics ?
          <div>
            <h2 className="mb-6 text-center text-xl font-semibold text-white sm:text-left">
              Lyrics
            </h2>
            <FirebaseSongLyrics
              englishLyrics={english}
              translatedLyrics={translated}
            />
          </div>
        : <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Music2 className="size-6 text-[#727272]" />
            <div>
              <p className="text-sm font-medium text-white">
                No lyrics available
              </p>
              <p className="mt-0.5 text-xs text-[#727272]">
                Lyrics for this song haven&apos;t been added yet.
              </p>
            </div>
          </div>
        }
      </section>
    </div>
  );
}
