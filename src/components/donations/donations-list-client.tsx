"use client";

import { Loader2 } from "lucide-react";

import type { FirebaseDonationCampaign } from "@/types/firebase-donation";

import { DonationCampaignCard } from "@/components/donations/donation-campaign-card";
import { useActiveDonationCampaigns } from "@/hooks/use-donation-campaigns";
import { splitCampaignsByCompletion } from "@/lib/donation-firestore";

type DonationsListClientProps = {
  initialCampaigns: FirebaseDonationCampaign[];
};

export function DonationsListClient({
  initialCampaigns,
}: DonationsListClientProps) {
  const { campaigns, loading } = useActiveDonationCampaigns(initialCampaigns);
  const { active, completed } = splitCampaignsByCompletion(campaigns);

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/50 py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!loading && active.length === 0 && completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No active donation campaigns available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <CampaignSection
        title="Active Campaigns"
        campaigns={active}
        emptyMessage="No active donation campaigns available."
      />
      <CampaignSection
        title="Completed Campaigns"
        campaigns={completed}
        emptyMessage="No completed campaigns yet."
      />
    </div>
  );
}

function CampaignSection({
  title,
  campaigns,
  emptyMessage,
}: {
  title: string;
  campaigns: FirebaseDonationCampaign[];
  emptyMessage: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-bold sm:text-xl">{title}</h2>
      {campaigns.length === 0 ?
        <div className="rounded-2xl border border-dashed border-border/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <DonationCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      }
    </section>
  );
}
