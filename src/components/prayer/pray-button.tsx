"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { usePrayerIntercession } from "@/hooks/use-prayer-intercession";
import { recordPrayerIntercession } from "@/lib/prayer-request-mutations";
import { cn } from "@/lib/utils";

type PrayButtonProps = {
  requestId: string;
  initialCount: number;
  className?: string;
  compact?: boolean;
};

export function PrayButton({
  requestId,
  initialCount,
  className,
  compact = false,
}: PrayButtonProps) {
  const { authUser } = useFirebaseAuth();
  const { ensureAuth } = useAuthGuard();
  const { hasPrayed, loading: intercessionLoading } = usePrayerIntercession(
    requestId,
    authUser?.uid
  );
  const [count, setCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  async function handlePray() {
    if (hasPrayed || submitting || intercessionLoading) return;
    if (!ensureAuth()) return;
    if (!authUser?.uid) return;

    setSubmitting(true);
    try {
      await recordPrayerIntercession(requestId, authUser.uid);
      setCount((current) => current + 1);
      toast.success("Thank you for praying");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to record your prayer";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = hasPrayed || submitting || intercessionLoading;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant={hasPrayed ? "secondary" : "outline"}
        disabled={isDisabled}
        onClick={handlePray}
        aria-pressed={hasPrayed}
        aria-label={
          hasPrayed ?
            "You have prayed for this request"
          : "Pray for this request"
        }
        className={cn(
          "rounded-full font-medium",
          hasPrayed && "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
        )}
      >
        {submitting ?
          <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
        : hasPrayed ?
          <Check className="mr-1.5 size-4" aria-hidden />
        : null}
        {hasPrayed ? "✔ You Prayed" : "🙏 I Prayed"}
      </Button>
      {!compact ?
        <span className="text-xs tabular-nums text-muted-foreground">
          {count.toLocaleString()} {count === 1 ? "prayer" : "prayers"}
        </span>
      : null}
    </div>
  );
}

export function PrayButtonStatic({
  request,
  className,
  compact,
}: {
  request: FirebasePrayerRequest;
  className?: string;
  compact?: boolean;
}) {
  return (
    <PrayButton
      requestId={request.id}
      initialCount={request.prayerCount}
      className={className}
      compact={compact}
    />
  );
}
