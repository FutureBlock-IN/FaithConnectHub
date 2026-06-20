"use client";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { ProtectedContentLink } from "@/components/auth/protected-content-link";
import { PrayerLikeButton } from "@/components/prayer/prayer-like-button";
import {
  formatPrayerDate,
  getPrayerRequestDisplayName,
} from "@/lib/prayer-request-firestore";
import { cn } from "@/lib/utils";

type PrayerWallCardProps = {
  request: FirebasePrayerRequest;
  className?: string;
};

export function PrayerWallCard({ request, className }: PrayerWallCardProps) {
  const detailHref = `/prayer-requests/${encodeURIComponent(request.id)}`;
  const displayName = getPrayerRequestDisplayName(request);

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border/50 bg-card",
        "transition-colors duration-150 hover:border-border hover:bg-card/80",
        className
      )}
    >
      {/* Card body — clickable link (auth-gated detail) */}
      <ProtectedContentLink
        href={detailHref}
        className="flex flex-1 flex-col gap-2.5 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
          {request.title}
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {request.request.replace(/\s+/g, " ").trim()}
        </p>
      </ProtectedContentLink>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/30 py-1 pl-4 pr-1">
        <ProtectedContentLink
          href={detailHref}
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          {/* Avatar initial */}
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {displayName?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <span className="text-xs font-semibold text-foreground/70">
            {displayName}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-[11px] text-muted-foreground">
            {formatPrayerDate(request.createdAt)}
          </span>
        </ProtectedContentLink>

        {/* Heart button — stop propagation prevents navigating */}
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <PrayerLikeButton
            requestId={request.id}
            initialCount={request.prayerCount}
          />
        </div>
      </div>
    </article>
  );
}