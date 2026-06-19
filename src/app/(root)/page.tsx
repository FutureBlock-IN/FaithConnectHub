import { HomeAdminFab } from "@/components/home-admin-fab";
import { HomeProfileSection } from "@/components/home-profile-section";
import { WorshipCollectionSection } from "@/components/worship/worship-collection-section";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/firebase-article-queries";
import { getPublishedSermons } from "@/lib/firebase-sermon-queries";
import { getAllSongs } from "@/lib/firebase-queries";

export const dynamic = "force-dynamic";

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
      url: `/api/og?title=${title}&description=${description}&image=https://graph.org/file/16937ebb693470d804f31.png`,
      alt: `${siteConfig.name} Homepage`,
    },
  },
};

export default async function HomePage() {
  const [songs, sermons, articles] = await Promise.all([
    getAllSongs(),
    getPublishedSermons(),
    getPublishedArticles(),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <HomeProfileSection />
      <HomeAdminFab />
      <WorshipCollectionSection
        songs={songs}
        sermons={sermons}
        articles={articles}
      />
    </div>
  );
}
