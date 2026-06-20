import { DonationsListClient } from "@/components/donations/donations-list-client";
import { getActiveDonationCampaignsCached } from "@/lib/cached-donation-data";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata = {
  title: "Donations",
  description: `Support ${siteConfig.name} ministries through secure online giving.`,
};

export default async function DonationsPage() {
  const campaigns = await getActiveDonationCampaignsCached();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Give
        </p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Donations</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Support active ministry campaigns with secure, transparent giving.
        </p>
      </div>

      <DonationsListClient initialCampaigns={campaigns} />
    </div>
  );
}
