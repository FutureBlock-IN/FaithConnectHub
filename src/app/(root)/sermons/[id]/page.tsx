import { notFound } from "next/navigation";

import { ContentAuthRequired } from "@/components/auth/content-auth-required";
import { ReadingDetailLayout } from "@/components/reading-detail-layout";
import { SermonMediaSection } from "@/components/sermons/sermon-media-section";
import { ShareContentButton } from "@/components/share-content-button";
import { siteConfig } from "@/config/site";
import { isAuthenticatedServer } from "@/lib/auth-server";
import { getSermonById } from "@/lib/firebase-sermon-queries";
import { getSongCoverUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SermonPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: SermonPageProps) {
  const { id } = await params;
  const sermon = await getSermonById(decodeURIComponent(id));

  if (!sermon || !sermon.isPublished) {
    return { title: "Sermon Not Found" };
  }

  return {
    title: `${sermon.title} | ${siteConfig.name}`,
    description: sermon.shortDescription.slice(0, 160),
  };
}

export default async function SermonPage({ params }: SermonPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const callbackPath = `/sermons/${encodeURIComponent(decodedId)}`;
  const isAuthenticated = await isAuthenticatedServer();

  if (!isAuthenticated) {
    return <ContentAuthRequired callbackPath={callbackPath} />;
  }

  const sermon = await getSermonById(decodedId);

  if (!sermon || !sermon.isPublished) {
    notFound();
  }

  const coverUrl = getSongCoverUrl(sermon.coverImage);

  return (
    <ReadingDetailLayout
      coverUrl={coverUrl}
      coverAlt={sermon.title}
      category={sermon.scriptureReference || undefined}
      title={sermon.title}
      subtitle={sermon.subtitle}
      shortDescription={sermon.shortDescription}
      author={sermon.speaker}
      dateCreated={sermon.dateCreated}
      content={sermon.content}
      beforeContent={
        <SermonMediaSection
          title={sermon.title}
          youtubeUrl={sermon.youtubeUrl}
          audioUrl={sermon.audioUrl}
        />
      }
      headerAction={
        <ShareContentButton
          title={sermon.title}
          description={sermon.shortDescription}
          path={`/sermons/${encodeURIComponent(sermon.id)}`}
        />
      }
    />
  );
}
