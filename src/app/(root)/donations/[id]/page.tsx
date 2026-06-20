import { DonationCampaignDetailClient } from "@/components/donations/donation-campaign-detail-client";
import { getDonationCampaignByIdCached } from "@/lib/cached-donation-data";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

type DonationCampaignPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: DonationCampaignPageProps) {
  const { id } = await params;
  const campaign = await getDonationCampaignByIdCached(id);

  return {
    title: campaign ? `${campaign.title} | Donate` : "Donate",
    description: campaign?.description ?? `Support ministries on ${siteConfig.name}.`,
  };
}

export default async function DonationCampaignPage({
  params,
}: DonationCampaignPageProps) {
  const { id } = await params;
  const campaign = await getDonationCampaignByIdCached(id);

  return (
    <div className="mx-auto w-full max-w-6xl pb-10 pt-2">
      <DonationCampaignDetailClient
        campaignId={id}
        initialCampaign={campaign}
      />
    </div>
  );
}
