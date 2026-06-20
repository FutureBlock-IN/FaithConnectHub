"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  decrementPrayerCount,
  incrementPrayerCount,
} from "@/lib/prayer-request-mutations";
import { isFirebasePermissionError } from "@/lib/firebase-utils";
import { cn } from "@/lib/utils";

const SESSION_PREFIX = "prayer-counted:";

function getSessionKey(requestId: string) {
  return `${SESSION_PREFIX}${requestId}`;
}

function readLikedFromSession(requestId: string): boolean {
  return sessionStorage.getItem(getSessionKey(requestId)) === "1";
}

type PrayerLikeButtonProps = {
  requestId: string;
  initialCount: number;
  className?: string;
};

export function PrayerLikeButton({
  requestId,
  initialCount,
  className,
}: PrayerLikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const pendingToggleRef = useRef(false);
  const { ensureAuth } = useAuthGuard();

  useEffect(() => {
    setHasLiked(readLikedFromSession(requestId));
  }, [requestId]);

  useEffect(() => {
    if (pendingToggleRef.current) return;
    setCount(initialCount);
  }, [initialCount]);

  async function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (submitting) return;
    if (!ensureAuth()) return;

    const sessionKey = getSessionKey(requestId);
    const nextLiked = !hasLiked;
    const previousLiked = hasLiked;
    const previousCount = count;

    pendingToggleRef.current = true;
    setSubmitting(true);

    setHasLiked(nextLiked);
    setCount((current) =>
      nextLiked ? current + 1 : Math.max(0, current - 1)
    );
    setJustToggled(true);
    window.setTimeout(() => setJustToggled(false), 350);

    if (nextLiked) {
      sessionStorage.setItem(sessionKey, "1");
    } else {
      sessionStorage.removeItem(sessionKey);
    }

    try {
      if (nextLiked) {
        await incrementPrayerCount(requestId);
      } else {
        await decrementPrayerCount(requestId);
      }
    } catch (error) {
      setHasLiked(previousLiked);
      setCount(previousCount);

      if (previousLiked) {
        sessionStorage.setItem(sessionKey, "1");
      } else {
        sessionStorage.removeItem(sessionKey);
      }

      if (isFirebasePermissionError(error)) {
        toast.error(
          "Prayer count update blocked. Deploy the latest Firestore rules, then try again."
        );
      } else {
        toast.error("Unable to update your prayer right now");
      }
    } finally {
      pendingToggleRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      aria-pressed={hasLiked}
      aria-label={
        hasLiked
          ? `Remove prayer. ${count} prayers`
          : `Pray for this request. ${count} prayers`
      }
      className={cn(
        "group inline-flex h-9 min-h-10 min-w-10 items-center gap-1.5 rounded-full px-3",
        "transition-all duration-150 active:scale-95",
        "hover:bg-rose-500/10",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "size-5 shrink-0 transition-all duration-200",
          justToggled && "scale-125",
          hasLiked
            ? "fill-rose-500 stroke-rose-500"
            : "fill-none stroke-muted-foreground stroke-[1.8] group-hover:stroke-rose-400"
        )}
        aria-hidden
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span
        className={cn(
          "text-sm font-semibold tabular-nums transition-colors",
          hasLiked
            ? "text-rose-500"
            : "text-muted-foreground group-hover:text-rose-400"
        )}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}

export function getPrayerLikedSessionKey(requestId: string) {
  return getSessionKey(requestId);
}
