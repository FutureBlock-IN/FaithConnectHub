"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { incrementPrayerCount } from "@/lib/prayer-request-mutations";

const SESSION_PREFIX = "prayer-counted:";

function getSessionKey(requestId: string) {
  return `${SESSION_PREFIX}${requestId}`;
}

type PrayButtonProps = {
  requestId: string;
  initialCount: number;
  className?: string;
};

export function PrayButton({
  requestId,
  initialCount,
  className,
}: PrayButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { ensureAuth } = useAuthGuard();

  useEffect(() => {
    setHasPrayed(sessionStorage.getItem(getSessionKey(requestId)) === "1");
  }, [requestId]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  async function handlePray() {
    if (hasPrayed || submitting) return;
    if (!ensureAuth()) return;

    setSubmitting(true);
    try {
      await incrementPrayerCount(requestId);
      setCount((current) => current + 1);
      setHasPrayed(true);
      sessionStorage.setItem(getSessionKey(requestId), "1");
      toast.success("Thank you for praying");
    } catch {
      toast.error("Unable to record your prayer right now");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={hasPrayed ? "secondary" : "default"}
      disabled={hasPrayed || submitting}
      onClick={handlePray}
      className={className}
    >
      🙏 {hasPrayed ? "Prayed" : "I Prayed"} · {count.toLocaleString()}
    </Button>
  );
}

export function PrayButtonStatic({
  request,
}: {
  request: FirebasePrayerRequest;
}) {
  return (
    <PrayButton requestId={request.id} initialCount={request.prayerCount} />
  );
}
