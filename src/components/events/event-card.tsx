"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import type { FirebaseEvent } from "@/types/firebase-event";

import { ImageWithFallback } from "@/components/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_SONG_COVER } from "@/config/site";
import { formatEventDate } from "@/lib/event-firestore";
import { cn, getSongCoverUrl } from "@/lib/utils";

type EventCardProps = {
  event: FirebaseEvent;
  className?: string;
};

export function EventCard({ event, className }: EventCardProps) {
  const href = `/events/${encodeURIComponent(event.id)}`;
  const coverUrl = getSongCoverUrl(event.bannerImage);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40 transition-colors duration-200 hover:border-border/80 hover:bg-card/60",
        className
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30">
        <ImageWithFallback
          src={coverUrl}
          fallback={DEFAULT_SONG_COVER}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          alt={event.title}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <Badge className="rounded-md border-0 bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
            {event.eventType}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">
          {event.title}
        </h3>

        <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {formatEventDate(event.eventDate)}
          </p>
          {event.eventTime ?
            <p className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5 shrink-0" aria-hidden />
              {event.eventTime}
            </p>
          : null}
          {event.location ?
            <p className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{event.location}</span>
            </p>
          : null}
        </div>
      </div>
    </Link>
  );
}
