import { ChevronRight } from "lucide-react";

import { ProtectedContentLink } from "@/components/auth/protected-content-link";
import type { FirebaseSong } from "@/types/firebase-song";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { DEFAULT_SONG_COVER } from "@/config/site";
import { cn, getSongCoverUrl } from "@/lib/utils";

type FirebaseSongCardProps = {
  song: FirebaseSong;
  className?: string;
};

export function FirebaseSongCard({ song, className }: FirebaseSongCardProps) {
  if (!song.id?.trim()) return null;

  const songHref = `/songs/${encodeURIComponent(song.id)}`;
  const coverUrl = getSongCoverUrl(song.imageUrl);
  const englishTitle = song.englishTitle ?? song.title ?? "";
  const teluguTitle = song.teluguTitle ?? "";

  return (
    <ProtectedContentLink
      href={songHref}
      className={cn(
        "group relative flex h-24 gap-2 rounded-lg border border-border/50 bg-card/40 transition-all duration-200",
        "hover:border-border/80 hover:bg-card/60 hover:shadow-sm",
        className
      )}
    >
      <div className="relative h-full w-24 shrink-0 overflow-hidden rounded-md">
        <ImageWithFallback
          src={coverUrl}
          fallback={DEFAULT_SONG_COVER}
          width={96}
          height={96}
          sizes="96px"
          alt={englishTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md">
            <svg
              className="h-3.5 w-3.5 translate-x-0.5 text-primary"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M3 2.5a.5.5 0 0 1 .765-.424l10 5.5a.5.5 0 0 1 0 .848l-10 5.5A.5.5 0 0 1 3 13.5v-11z" />
            </svg>
          </div>
        </div>

        {song.youtubeUrl?.trim() ? (
          <span className="absolute top-0.5 right-0.5 z-10 flex items-center gap-0.5 rounded-full bg-red-600 px-1 py-0 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
            <svg className="h-1.5 w-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YT
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-3 py-2">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary">
          {englishTitle}
        </h3>

        {teluguTitle ? (
          <p className="line-clamp-1 text-sm leading-tight text-muted-foreground">
            {teluguTitle}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-center pr-3 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
        <ChevronRight className="h-5 w-5" />
      </div>
    </ProtectedContentLink>
  );
}
