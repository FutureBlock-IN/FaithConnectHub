import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { ContentAuthRequired } from "@/components/auth/content-auth-required";
import { SongDetailClient } from "@/components/music/song-detail-client";
import { siteConfig } from "@/config/site";
import { isAuthenticatedServer } from "@/lib/auth-server";
import { getSongById } from "@/lib/firebase-queries";
import { getSongCoverUrl } from "@/lib/utils";
import { DEFAULT_SONG_COVER } from "@/config/site";

type SongDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SongDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongById(id);

  if (!song) {
    return { title: siteConfig.name };
  }

  const englishTitle = song.englishTitle ?? song.title;
  const teluguTitle  = song.teluguTitle  ?? "";
  const coverUrl     = getSongCoverUrl(song.imageUrl) || `${siteConfig.url}${DEFAULT_SONG_COVER}`;

  // Absolute URL — required for WhatsApp preview to work
  const songUrl     = `${siteConfig.url}/songs/${encodeURIComponent(id)}`;
  const description = teluguTitle && teluguTitle !== englishTitle
    ? `${teluguTitle} • ${siteConfig.name}`
    : `${englishTitle} • ${siteConfig.name}`;

  return {
    title: englishTitle,
    description,

    openGraph: {
      title: englishTitle,
      description,
      url: songUrl,                      // ✅ absolute URL
      siteName: siteConfig.name,
      type: "music.song",
      images: [
        {
          url: coverUrl,                 // ✅ must be absolute URL
          width: 800,
          height: 800,
          alt: englishTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",       // ✅ shows big image in Telegram too
      title: englishTitle,
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

  const song = await getSongById(id);

  if (!song) {
    notFound();
  }

  return <SongDetailClient song={song} />;
}