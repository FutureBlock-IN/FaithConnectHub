import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  getActiveDonationCampaigns,
  getDonationCampaignById,
} from "./firebase-donation-queries";
import { recordMatchesChurchScope } from "./church-scope";

const REVALIDATE_SECONDS = 60;

export async function getActiveDonationCampaignsCached(churchId: string) {
  return unstable_cache(
    async () => getActiveDonationCampaigns(churchId),
    ["active-donation-campaigns", churchId],
    { revalidate: REVALIDATE_SECONDS, tags: ["donations", `church-${churchId}`] }
  )();
}

export const getDonationCampaignByIdCached = cache(
  async (churchId: string, campaignId: string) => {
    return unstable_cache(
      async () => {
        const campaign = await getDonationCampaignById(campaignId);
        if (!recordMatchesChurchScope(campaign, churchId)) return null;
        return campaign;
      },
      ["donation-campaign-by-id", churchId, campaignId],
      {
        revalidate: REVALIDATE_SECONDS,
        tags: [`donation-campaign-${campaignId}`, `church-${churchId}`],
      }
    )();
  }
);
