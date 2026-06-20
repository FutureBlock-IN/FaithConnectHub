import { notFound } from "next/navigation";

import { ContentAuthRequired } from "@/components/auth/content-auth-required";
import { PrayerRequestDetailClient } from "@/components/prayer/prayer-request-detail-client";
import { isAuthenticatedServer } from "@/lib/auth-server";
import { getPrayerRequestById } from "@/lib/firebase-prayer-request-queries";
import { siteConfig } from "@/config/site";

type PrayerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PrayerRequestDetailPageProps) {
  const { id } = await params;
  const request = await getPrayerRequestById(id);

  if (!request || request.status !== "approved") {
    return { title: "Prayer Request" };
  }

  return {
    title: request.title,
    description: `Prayer request on ${siteConfig.name}`,
  };
}

export default async function PrayerRequestDetailPage({
  params,
}: PrayerRequestDetailPageProps) {
  const { id } = await params;
  const callbackPath = `/prayer-requests/${encodeURIComponent(id)}`;
  const isAuthenticated = await isAuthenticatedServer();

  if (!isAuthenticated) {
    return <ContentAuthRequired callbackPath={callbackPath} />;
  }

  const request = await getPrayerRequestById(id);

  if (!request || request.status !== "approved") {
    notFound();
  }

  return (
    <PrayerRequestDetailClient requestId={id} initialRequest={request} />
  );
}
