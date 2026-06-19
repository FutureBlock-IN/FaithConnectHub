 
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CloudDownload, Download, Loader2, Music2, PlayCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import type { FirebaseSong } from "@/types/firebase-song";

import { FirebaseSongLyrics } from "@/components/music/firebase-song-lyrics";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentSongIndex,
  useIsPlayerInit,
  useQueue,
} from "@/hooks/use-store";
import {
  generateLyricsTxt,
  getLyricsTxtFilename,
} from "@/lib/generate-lyrics-txt";
import { getSongLyricsContent } from "@/lib/song-lyrics";
import { getSongCoverUrl } from "@/lib/utils";
import { DEFAULT_SONG_COVER } from "@/config/site";
import { incrementPlayCount } from "@/lib/firebase-queries";
import { getSongAlternateTitle, getSongDisplayTitle } from "@/lib/song-firestore";
import { ShareSongButton } from "./share-song";

type SongDetailClientProps = {
  song: FirebaseSong;
};

function downloadBlob(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 150);
}

export function SongDetailClient({ song }: SongDetailClientProps) {
  const [, setQueue] = useQueue();
  const [, setCurrentIndex] = useCurrentSongIndex();
  const [, setIsPlayerInit] = useIsPlayerInit();
  const [downloadingLyrics, setDownloadingLyrics] = React.useState(false);
  const [downloadingAudio, setDownloadingAudio] = React.useState(false);
  const [showVideo, setShowVideo] = React.useState(false);

  const { english, translated, hasLyrics } = getSongLyricsContent(song);

  const audioUrl = song.audioUrl?.trim() ?? "";
  const coverUrl = getSongCoverUrl(song.imageUrl);
  const youtubeUrl = song.youtubeUrl?.trim() ?? "";

  const displayTitle = getSongDisplayTitle(song);
  const alternateTitle = getSongAlternateTitle(song) ?? "";

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
      setQueue([{
        id: song.id,
        name: displayTitle,
        subtitle: alternateTitle,
        image: coverUrl,
        duration: 0,
        download_url: audioUrl,
        url: `/songs/${encodeURIComponent(song.id)}`,
        type: "song",
        artists: [],
      }]);
      setCurrentIndex(0);
      setIsPlayerInit(true);
    } else {
      setQueue([]);
      setCurrentIndex(0);
      setIsPlayerInit(false);
    }
  }, [song.id, audioUrl, displayTitle, alternateTitle, coverUrl, setQueue, setCurrentIndex, setIsPlayerInit]);

  async function handleDownloadLyrics() {
    if (!hasLyrics) { toast.error("No lyrics available to download"); return; }
    setDownloadingLyrics(true);
    try {
      const txtBlob = generateLyricsTxt({
        title: displayTitle,
        originalLyrics: translated,
        translationLyrics: english,
      });
      downloadBlob(txtBlob, getLyricsTxtFilename(displayTitle));
      toast.success("Lyrics downloaded");
    } catch { toast.error("Failed to download lyrics"); }
    finally { setDownloadingLyrics(false); }
  }

  async function handleDownloadAudio() {
    if (!audioUrl) return;
    setDownloadingAudio(true);
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("Failed to fetch audio");
      const blob = await response.blob();
      const extension = audioUrl.split(".").pop()?.split("?")[0] || "mp3";
      downloadBlob(blob, `${displayTitle}.${extension}`);
      toast.success("Audio downloaded");
    } catch { toast.error("Failed to download audio"); }
    finally { setDownloadingAudio(false); }
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      {/* Back nav */}
      <div className="py-4 sm:py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Songs
        </Link>
      </div>

      {/* ── Hero Card ── */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="relative flex flex-col items-center gap-5 overflow-hidden px-6 py-8 sm:flex-row sm:items-end sm:gap-6 sm:px-8 sm:py-10">
          {/* Blurred backdrop */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 scale-110 overflow-hidden">
            <ImageWithFallback src={coverUrl} fallback={DEFAULT_SONG_COVER} width={800} height={300} alt=""
              className="h-full w-full object-cover opacity-20 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/40" />
          </div>

          {/* Cover art */}
          <div className="relative shrink-0">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border/60 shadow-xl sm:h-40 sm:w-40 md:h-44 md:w-44">
              <ImageWithFallback src={coverUrl} fallback={DEFAULT_SONG_COVER} width={176} height={176}
                sizes="176px" alt={displayTitle} className="size-full object-cover" />
              <Skeleton className="absolute inset-0 -z-10 size-full" />
            </div>
            {audioUrl && (
              <span className="absolute -bottom-2 -right-2 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
                ♪ Audio
              </span>
            )}
          </div>

          {/* Title + actions */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:items-start">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                Worship Song
              </p>
              {/* English title — primary, bold */}
              <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                {displayTitle}
              </h1>
              {/* Telugu title — secondary, lighter */}
              {alternateTitle && (
                <p className="text-base font-medium text-muted-foreground sm:text-lg">
                  {alternateTitle}
                </p>
              )}
              {(song.playCount ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">{song.playCount} plays</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm"
                className="h-9 gap-2 rounded-full px-4 text-sm font-semibold shadow"
                disabled={!hasLyrics || downloadingLyrics} onClick={handleDownloadLyrics}>
                {downloadingLyrics ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                Lyrics
              </Button>
              {audioUrl && (
                <Button type="button" variant="outline" size="sm"
                  className="h-9 gap-2 rounded-full px-4 text-sm"
                  disabled={downloadingAudio} onClick={handleDownloadAudio}>
                  {downloadingAudio ? <Loader2 className="size-3.5 animate-spin" /> : <CloudDownload className="size-3.5" />}
                  Audio
                </Button>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400">
                  <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              )}

               {/* ✅ Share button — add this */}
  <ShareSongButton
    songId={song.id}
    songTitle={displayTitle}
    alternateTitle={alternateTitle}
  />
            </div>
          </div>
        </div>

        {/* YouTube collapsible */}
        {embedSrc && (
          <div className="border-t border-border/40 px-6 py-4 sm:px-8">
            <button type="button" onClick={() => setShowVideo((s) => !s)}
              className="flex w-full items-center justify-between gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <span className="flex items-center gap-2">
                <PlayCircle className="size-4 text-red-500" />
                {showVideo ? "Hide video" : "Watch song video"}
              </span>
              <ChevronDown className={`size-4 transition-transform duration-200 ${showVideo ? "rotate-180" : ""}`} />
            </button>
            {showVideo && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border/50 shadow">
                <div className="relative" style={{ paddingTop: "56.25%" }}>
                  <iframe src={embedSrc} title={`YouTube video for ${displayTitle}`}
                    className="absolute inset-0 h-full w-full" frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Lyrics ── */}
      <div className="mt-6">
        {hasLyrics ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
            <div className="border-b border-border/40 px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="font-heading text-base font-semibold sm:text-lg">
                  Lyrics
                </h2>
              </div>
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <FirebaseSongLyrics
                englishLyrics={english}
                translatedLyrics={translated}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <span className="text-xl">📖</span>
            </div>
            <div>
              <p className="text-sm font-medium">No lyrics available</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Lyrics for this song haven&apos;t been added yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}