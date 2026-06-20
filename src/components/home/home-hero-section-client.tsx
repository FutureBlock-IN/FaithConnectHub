"use client";

import React from "react";

import type { FirebaseChurch } from "@/types/firebase-church";
import type { WorshipVerse } from "@/lib/worship-verses";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const ROTATION_MS = 6500;

const MINISTRY_ROTATIONS = [
  {
    title: "Worship Through Song",
    subtitle: "Lift your voice with psalms, hymns, and songs of praise.",
  },
  {
    title: "Grow Through God's Word",
    subtitle: "Read sermons and articles that strengthen your faith.",
  },
  {
    title: "Pray Together",
    subtitle: "Share requests and stand with the community in prayer.",
  },
  {
    title: "Join The Community",
    subtitle: "Connect with events, fellowship, and ministry life.",
  },
  {
    title: "Support The Mission",
    subtitle: "Give generously to advance the work of the gospel.",
  },
] as const;

type HomeHeroSectionClientProps = {
  church?: FirebaseChurch | null;
  verse: WorshipVerse;
};

export function HomeHeroSectionClient({
  church,
  verse,
}: HomeHeroSectionClientProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  const ministryName = church?.name || siteConfig.name;
  const ministryMessage =
    church?.welcomeMessage?.trim() ||
    "A place to worship, learn, pray, and serve together.";

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % MINISTRY_ROTATIONS.length);
        setVisible(true);
      }, 280);
    }, ROTATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  const rotation = MINISTRY_ROTATIONS[activeIndex]!;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-primary/5 shadow-sm",
        "h-[240px] sm:h-[260px] md:h-[380px] lg:h-[400px]"
      )}
      style={
        church?.primaryColor ?
          ({ "--hero-accent": church.primaryColor } as React.CSSProperties)
        : undefined
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl md:h-40 md:w-40"
      />

      <div className="relative flex h-full flex-col justify-between gap-3 p-4 sm:p-5 md:gap-4 md:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              {ministryName}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {ministryMessage}
            </p>
          </div>

          <div
            className="flex shrink-0 gap-1 pt-1"
            role="tablist"
            aria-label="Ministry highlights"
          >
            {MINISTRY_ROTATIONS.map((item, index) => (
              <span
                key={item.title}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={item.title}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex ?
                    "w-4 bg-primary"
                  : "w-1.5 bg-primary/25"
                )}
              />
            ))}
          </div>
        </div>

        <div
          className={cn(
            "space-y-1 transition-opacity duration-300 md:space-y-2",
            visible ? "opacity-100" : "opacity-0"
          )}
          aria-live="polite"
        >
          <h1 className="font-heading text-lg font-bold leading-tight sm:text-xl md:text-2xl lg:text-3xl">
            {rotation.title}
          </h1>
          <p className="line-clamp-2 max-w-xl text-xs leading-snug text-muted-foreground sm:text-sm md:line-clamp-none md:text-base">
            {rotation.subtitle}
          </p>
        </div>

        <div className="relative rounded-xl border border-border/40 bg-background/70 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3 md:px-5 md:py-4">
          <div
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-[0.05] md:right-4"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 80 80"
              fill="currentColor"
              className="text-primary md:h-14 md:w-14"
            >
              <rect x="34" y="0" width="12" height="80" rx="4" />
              <rect x="0" y="28" width="80" height="12" rx="4" />
            </svg>
          </div>

          <div className="relative space-y-1 md:space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/60">
                Verse of the Day
              </p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {verse.reference}
              </span>
            </div>
            <blockquote className="line-clamp-2 font-script text-xs italic leading-snug text-foreground/90 sm:text-sm md:line-clamp-3 md:text-base md:leading-relaxed">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
