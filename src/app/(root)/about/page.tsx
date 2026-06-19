import type { Metadata } from "next";
import Link from "next/link";

import { ImageWithFallback } from "@/components/image-with-fallback";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `About ${siteConfig.name}`,
  description: `Learn about ${siteConfig.name}, a Christian worship music ministry dedicated to spreading the Gospel through worship songs and lyrics.`,
};

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center py-20 sm:py-28 text-center px-4">
        {/* Decorative cross-glow behind logo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Logo with golden ring */}
          <div className="rounded-full p-1 ring-2 ring-primary/40 shadow-lg">
            <ImageWithFallback
              src={siteConfig.image || "/images/logo.png"}
              fallback="/images/logo.png"
              alt={siteConfig.name}
              width={96}
              height={96}
              className="h-20 w-20 rounded-full object-contain sm:h-24 sm:w-24"
            />
          </div>

          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
              Christian Worship Ministry
            </p>
            <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              {siteConfig.name}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Songs that draw hearts closer to God — in Telugu, English, and every language
              the Spirit moves.
            </p>
          </div>

          {/* Ornamental divider */}
          <div className="mt-4 flex items-center gap-3 text-primary/40">
            <span className="block h-px w-12 bg-current" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="opacity-60">
              <path d="M7 0v14M0 7h14" strokeWidth="1.5" stroke="currentColor" fill="none" />
            </svg>
            <span className="block h-px w-12 bg-current" />
          </div>
        </div>
      </section>

      {/* ── Ministry Profile ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* Photo */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              {/* Decorative square offset behind image */}
              <div
                aria-hidden
                className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border-2 border-primary/20"
              />
              <ImageWithFallback
                src={siteConfig.profile.image || "/images/logo.png"}
                fallback="/images/logo.png"
                alt={siteConfig.profile.name}
                width={340}
                height={400}
                className="relative z-10 h-72 w-64 rounded-2xl border border-border/60 object-cover shadow-xl sm:h-80 sm:w-72"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                Music Minister & Worship Leader
              </p>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Rev. Dr. Amshumathi Mary Darla
              </h2>
            </div>

            <div className="h-0.5 w-12 rounded-full bg-primary/40" />

            <p className="text-base leading-relaxed text-muted-foreground">
              Rev. Dr. Amshumathi Mary Darla is a dedicated music minister and worship leader
              committed to spreading the Gospel through contemporary Christian worship songs.
              With a passion for worship and a heart for ministry, she has composed and
              performed numerous Telugu and English worship songs that inspire believers to
              deepen their faith and strengthen their relationship with God.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground">
              Her ministry focuses on creating accessible, meaningful worship experiences that
              bring people closer to God and encourage spiritual growth in the Christian
              community.
            </p>
          </div>
        </div>
      </section>

      {/* ── Scripture Banner ── */}
      <section className="relative overflow-hidden bg-primary py-14 px-6 text-center sm:py-16">
        {/* subtle watermark cross */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5"
        >
          <svg width="320" height="320" viewBox="0 0 320 320" fill="white">
            <rect x="140" y="0" width="40" height="320" rx="6" />
            <rect x="0" y="110" width="320" height="40" rx="6" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
            Psalm 104:33
          </p>
          <blockquote className="font-heading text-xl font-medium leading-relaxed text-primary-foreground sm:text-2xl md:text-3xl">
            &ldquo;I will sing unto the Lord as long as I live; I will sing praise to my God
            while I have my being.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Why We Exist
            </p>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Our Mission</h2>
          </div>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            To spread the Gospel through worship songs, encourage believers, and make
            Christian worship lyrics easily accessible to everyone. We believe that worship is
            a powerful tool for spiritual transformation and community building — inspiring
            deeper faith, fostering meaningful connections, and strengthening churches and
            homes worldwide.
          </p>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Resources
            </p>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">What We Offer</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "♪",
                title: "Telugu Worship Lyrics",
                desc: "Original Telugu worship songs for deeper spiritual connection with God.",
              },
              {
                icon: "♫",
                title: "English Worship Lyrics",
                desc: "Contemporary English worship songs with meaningful lyrics for modern worship.",
              },
              {
                icon: "⬇",
                title: "Downloadable Lyrics and Audio",
                desc: "Easy-to-download lyrics and audio files for personal use, worship services, and Bible study.",
              },
              {
                icon: "✦",
                title: "Worship Resources",
                desc: "Comprehensive materials to enhance your spiritual journey and ministry.",
              },
              {
                icon: "✝",
                title: "Christian Music Ministry",
                desc: "Fostering worship, building community, and spreading God's message through music.",
              },
              {
                icon: "🙏",
                title: "Accessible to All",
                desc: "Free, searchable lyrics so every believer can worship fully — anywhere.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-lg">
                  {item.icon}
                </div>
                <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
                {/* bottom accent line on hover */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connect ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20 text-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Stay Connected
            </p>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Connect With Us</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Follow along for new songs, lyrics, and worship resources.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {siteConfig.author.url && (
              <Link
                href={siteConfig.author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                🌐 Youtube
              </Link>
            )}
            {siteConfig.author.email && (
              <Link
                href={`mailto:${siteConfig.author.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                ✉ Email
              </Link>
            )}
            {siteConfig.links.x && (
              <Link
                href={siteConfig.links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                𝕏 Twitter
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}