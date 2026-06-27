"use client";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { ProtectedContentLink } from "@/components/auth/protected-content-link";
import {
  PrayerAnsweredBadge,
  PrayerAnsweredButton,
} from "@/components/prayer/prayer-answered-button";
import { PrayButton } from "@/components/prayer/pray-button";
import {
  formatPrayerDate,
  getPrayerRequestDisplayName,
} from "@/lib/prayer-request-firestore";
import { getPrayerCategoryLabel } from "@/lib/prayer-request-validation";
import { cn } from "@/lib/utils";

type PrayerWallCardProps = {
  request: FirebasePrayerRequest;
  className?: string;
  /** When false, the card stays on the list page (no detail navigation). */
  linkToDetail?: boolean;
};

export function PrayerWallCard({
  request,
  className,
  linkToDetail = true,
}: PrayerWallCardProps) {
  const detailHref = `/prayer-requests/${encodeURIComponent(request.id)}`;
  const displayName = getPrayerRequestDisplayName(request);
  const categoryLabel = getPrayerCategoryLabel(request.category);

  const bodyClassName =
    "flex flex-1 flex-col gap-2.5 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const metaClassName = "flex items-center gap-1.5";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border/50 bg-card",
        "transition-colors duration-150 hover:border-border hover:bg-card/80",
        className
      )}
    >
      {linkToDetail ?
        <ProtectedContentLink href={detailHref} className={bodyClassName}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {categoryLabel}
            </span>
            {request.isAnswered ?
              <PrayerAnsweredBadge className="text-[10px]" />
            : null}
          </div>
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
            {request.title}
          </h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {request.request.replace(/\s+/g, " ").trim()}
          </p>
        </ProtectedContentLink>
      : <div className={bodyClassName}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {categoryLabel}
            </span>
            {request.isAnswered ?
              <PrayerAnsweredBadge className="text-[10px]" />
            : null}
          </div>
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
            {request.title}
          </h3>
          <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {request.request.replace(/\s+/g, " ").trim()}
          </p>
        </div>
      }

      <div className="flex flex-col gap-2 border-t border-border/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {linkToDetail ?
          <ProtectedContentLink
            href={detailHref}
            className={cn(metaClassName, "transition-colors hover:text-foreground")}
          >
            <PrayerWallCardMeta displayName={displayName} createdAt={request.createdAt} />
          </ProtectedContentLink>
        : <div className={metaClassName}>
            <PrayerWallCardMeta displayName={displayName} createdAt={request.createdAt} />
          </div>
        }

        <div
          className="flex shrink-0 flex-wrap items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <PrayerAnsweredButton request={request} />
          <PrayButton
            requestId={request.id}
            initialCount={request.prayerCount}
            compact
          />
        </div>
      </div>
    </article>
  );
}

function PrayerWallCardMeta({
  displayName,
  createdAt,
}: {
  displayName: string;
  createdAt: FirebasePrayerRequest["createdAt"];
}) {
  return (
    <>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        {displayName?.charAt(0).toUpperCase() ?? "A"}
      </div>
      <span className="text-xs font-semibold text-foreground/70">{displayName}</span>
      <span className="text-muted-foreground/40">·</span>
      <span className="text-[11px] text-muted-foreground">
        {formatPrayerDate(createdAt)}
      </span>
    </>
  );
}
