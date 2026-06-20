import { HomeAdminFab } from "@/components/home-admin-fab";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeSongsSection } from "@/components/home/home-songs-section";
import { siteConfig } from "@/config/site";
import { getPublishedSongsCached } from "@/lib/cached-worship-data";

export const revalidate = 60;

const title = siteConfig.name;
const description = `Christian worship songs and lyrics — listen, sing, and grow in faith on ${siteConfig.name}.`;

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    images: {
      url: `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(`${siteConfig.url.replace(/\/$/, "")}${siteConfig.image}`)}`,
      alt: `${siteConfig.name} Homepage`,
    },
  },
};

export default async function HomePage() {
  const songs = await getPublishedSongsCached();

  return (
    <div className="space-y-8 sm:space-y-10">
      <HomeAdminFab />
      <HomeHeroSection />
      <HomeSongsSection initialSongs={songs} />
    </div>
  );
}
