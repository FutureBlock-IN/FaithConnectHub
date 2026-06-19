import { ImageWithFallback } from "@/components/image-with-fallback";
import { siteConfig } from "@/config/site";

const VERSES = [
  {
    reference: "Psalm 104:33",
    text: "I will sing unto the Lord as long as I live: I will sing praise to my God while I have my being.",
  },
  {
    reference: "Psalm 95:1",
    text: "O come, let us sing unto the Lord: let us make a joyful noise to the rock of our salvation.",
  },
  {
    reference: "Psalm 100:2",
    text: "Serve the Lord with gladness: come before his presence with singing.",
  },
  {
    reference: "Ephesians 5:19",
    text: "Speaking to yourselves in psalms and hymns and spiritual songs, singing and making melody in your heart to the Lord.",
  },
  {
    reference: "Colossians 3:16",
    text: "Singing with grace in your hearts to the Lord.",
  },
  {
    reference: "Psalm 96:1",
    text: "O sing unto the Lord a new song: sing unto the Lord, all the earth.",
  },
  {
    reference: "Psalm 98:4",
    text: "Make a joyful noise unto the Lord, all the earth: make a loud noise, and rejoice, and sing praise.",
  },
];

function getVerseOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return VERSES[dayOfYear % VERSES.length]!;
}

export function HomeProfileSection() {
  const verse = getVerseOfTheDay();

  return (
    <section className="relative hidden overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm md:block">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* ── Left: Profile ── */}
        <div className="flex items-center gap-3 p-4 sm:min-w-[240px] sm:max-w-xs sm:shrink-0 md:min-w-[260px] lg:p-5">
          <div className="relative shrink-0">
            <ImageWithFallback
              src={siteConfig.profile.image || "/images/logo.png"}
              fallback="/images/profile.png"
              alt={siteConfig.profile.name}
              width={64}
              height={64}
              className="size-12 rounded-full object-cover ring-2 ring-primary/25 sm:size-14"
              priority
            />
          </div>

          <div className="min-w-0 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
              {siteConfig.name}
            </p>
            <h1 className="truncate font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
              {siteConfig.profile.name}
            </h1>
            <p className="mt-0.5 truncate text-left text-xs text-muted-foreground">
              Christian Worship Music &amp; Lyrics
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mx-4 h-px shrink-0 bg-border/40 sm:mx-0 sm:h-auto sm:w-px sm:self-stretch"
          aria-hidden
        />

        {/* ── Right: Verse of the Day ── */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-center p-4 pt-0 text-left sm:p-5 sm:pl-6">
          <div
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-[0.05]"
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

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
              Verse of the Day
            </p>
            <span className="text-[10px] font-bold text-primary/80">
              {verse.reference}
            </span>
          </div>
          <blockquote className="mt-1.5 line-clamp-2 font-script text-sm italic leading-relaxed text-foreground/80 sm:text-base">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
