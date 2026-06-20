import { notFound } from "next/navigation";

import { EventDetailClient } from "@/components/events/event-detail-client";
import { siteConfig } from "@/config/site";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getEventByIdCached } from "@/lib/cached-event-data";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { id } = await params;
  const { churchId } = await getPageChurchContext();
  const event = await getEventByIdCached(churchId, decodeURIComponent(id));

  if (!event || event.status !== "published") {
    return { title: "Event" };
  }

  return {
    title: `${event.title} | ${siteConfig.name}`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const { churchId } = await getPageChurchContext();
  const event = await getEventByIdCached(churchId, decodeURIComponent(id));

  if (!event || event.status !== "published") {
    notFound();
  }

  return <EventDetailClient eventId={event.id} initialEvent={event} />;
}
