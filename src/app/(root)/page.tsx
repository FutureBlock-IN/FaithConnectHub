import { HomeAdminFab } from "@/components/home-admin-fab";
import { WorshipCollectionSection } from "@/components/worship/worship-collection-section";
import { siteConfig } from "@/config/site";
import { getWorshipCatalogCached } from "@/lib/cached-worship-data";

export const revalidate = 60;

const title = siteConfig.name;
const description = `Listen to Christian music and read Telugu and English lyrics on ${siteConfig.name}.`;

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
  const { songs, sermons, articles } = await getWorshipCatalogCached();

  return (
    <div className="space-y-5 sm:space-y-6">
      <HomeAdminFab />
      <WorshipCollectionSection
        songs={songs}
        sermons={sermons}
        articles={articles}
      />
    </div>
  );
}
