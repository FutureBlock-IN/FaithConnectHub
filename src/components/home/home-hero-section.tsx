import Link from "next/link";
import { ArrowRight, Music2 } from "lucide-react";

import { ImageWithFallback } from "@/components/image-with-fallback";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getVerseOfTheDay } from "@/lib/worship-verses";

export function HomeHeroSection() {
  const verse = getVerseOfTheDay();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex min-h-[280px] flex-col gap-4 p-5 sm:min-h-[320px] sm:p-6 md:min-h-[360px] md:flex-row md:items-center md:gap-6 lg:max-h-[420px]">
        <div className="flex items-center gap-4 md:w-1/2">
          <div className="relative shrink-0">
            <ImageWithFallback
              src={siteConfig.profile.image || "/images/logo.png"}
              fallback="/images/profile.png"
              alt={siteConfig.profile.name}
              width={200}
              height={240}
              className="h-28 w-24 rounded-xl border border-border/60 object-cover shadow-md sm:h-32 sm:w-28 md:h-40 md:w-32"
              priority
            />
          </div>

          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              Christian Worship Ministry
            </p>
            <h1 className="font-heading text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
              {siteConfig.name}
            </h1>
            <p className="line-clamp-2 max-w-sm text-xs text-muted-foreground sm:text-sm">
              A Christian Worship Songs &amp; Lyrics Platform.
            </p>
             
          </div>
        </div>

        <div className="relative rounded-xl border border-border/40 bg-background/70 p-4 backdrop-blur-sm sm:p-5 md:w-1/2">
          <div
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.06]"
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 80 80"
              fill="currentColor"
              className="text-primary"
            >
              <rect x="34" y="0" width="12" height="80" rx="4" />
              <rect x="0" y="28" width="80" height="12" rx="4" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
                Verse of the Day
              </p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {verse.reference}
              </span>
            </div>
            <blockquote className="line-clamp-4 font-script text-sm italic leading-relaxed text-foreground/90 sm:text-base">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
