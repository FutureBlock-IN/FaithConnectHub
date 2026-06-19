import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

import { ContentAuthRequired } from "@/components/auth/content-auth-required";
import { SongDetailClient } from "@/components/music/song-detail-client";
import { siteConfig } from "@/config/site";
import { isAuthenticatedServer } from "@/lib/auth-server";
import { getSongByIdCached } from "@/lib/cached-worship-data";
import { isSongPublished, getSongAlternateTitle, getSongDisplayTitle } from "@/lib/song-firestore";
import { getSongCoverUrl } from "@/lib/utils";
import { DEFAULT_SONG_COVER } from "@/config/site";

type SongDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SongDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongByIdCached(id);

  if (!song) {
    return { title: siteConfig.name };
  }

  const displayTitle = getSongDisplayTitle(song);
  const alternateTitle = getSongAlternateTitle(song) ?? "";
  const coverUrl     = getSongCoverUrl(song.imageUrl) || `${siteConfig.url}${DEFAULT_SONG_COVER}`;

  // Absolute URL — required for WhatsApp preview to work
  const songUrl     = `${siteConfig.url}/songs/${encodeURIComponent(id)}`;
  const description = alternateTitle && alternateTitle !== displayTitle
    ? `${alternateTitle} • ${siteConfig.name}`
    : `${displayTitle} • ${siteConfig.name}`;

  return {
    title: displayTitle,
    description,

    openGraph: {
      title: displayTitle,
      description,
      url: songUrl,                      // ✅ absolute URL
      siteName: siteConfig.name,
      type: "music.song",
      images: [
        {
          url: coverUrl,                 // ✅ must be absolute URL
          width: 800,
          height: 800,
          alt: displayTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",       // ✅ shows big image in Telegram too
      title: displayTitle,
      description,
      images: [coverUrl],
    },
  };
}

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const { id } = await params;
  const callbackPath = `/songs/${encodeURIComponent(id)}`;
  const isAuthenticated = await isAuthenticatedServer();

  if (!isAuthenticated) {
    return <ContentAuthRequired callbackPath={callbackPath} />;
  }

  const song = await getSongByIdCached(id);

  if (!song || !isSongPublished(song)) {
    notFound();
  }

  return <SongDetailClient song={song} />;
}