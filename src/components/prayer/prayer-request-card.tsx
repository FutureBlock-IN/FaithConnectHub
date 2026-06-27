import { CalendarDays } from "lucide-react";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { ProtectedContentLink } from "@/components/auth/protected-content-link";
import { PrayerAnsweredBadge } from "@/components/prayer/prayer-answered-button";
import { PrayButtonStatic } from "@/components/prayer/pray-button";
import {
  formatPrayerDate,
  getPrayerRequestDisplayName,
  toPrayerRequestPreview,
} from "@/lib/prayer-request-firestore";
import { getPrayerCategoryLabel } from "@/lib/prayer-request-validation";
import { cn } from "@/lib/utils";

type PrayerRequestCardProps = {
  request: FirebasePrayerRequest;
  compact?: boolean;
  showPrayButton?: boolean;
  className?: string;
};

export function PrayerRequestCard({
  request,
  compact = false,
  showPrayButton = true,
  className,
}: PrayerRequestCardProps) {
  const displayName = getPrayerRequestDisplayName(request);
  const detailHref = `/prayer-requests/${encodeURIComponent(request.id)}`;
  const categoryLabel = getPrayerCategoryLabel(request.category);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-colors hover:border-primary/25",
        className
      )}
    >
      <div className={cn("space-y-4", compact ? "p-4 sm:p-5" : "p-5 sm:p-6")}>
        <div className="space-y-2">
          <ProtectedContentLink
            href={detailHref}
            className="block space-y-2 transition-colors hover:text-primary"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {categoryLabel}
              </span>
              {request.isAnswered ?
                <PrayerAnsweredBadge className="text-[10px]" />
              : null}
            </div>
            <h3
              className={cn(
                "font-heading font-semibold text-foreground",
                compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
              )}
            >
              {request.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {compact ?
                toPrayerRequestPreview(request.request, 140)
              : toPrayerRequestPreview(request.request, 220)}
            </p>
          </ProtectedContentLink>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{displayName}</span>
            </p>
            <p className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatPrayerDate(request.createdAt)}
            </p>
          </div>

          {showPrayButton ?
            <PrayButtonStatic request={request} compact />
          : null}
        </div>
      </div>
    </article>
  );
}
