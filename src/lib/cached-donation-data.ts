import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  getActiveDonationCampaigns,
  getDonationCampaignById,
} from "./firebase-donation-queries";

const REVALIDATE_SECONDS = 60;

export const getActiveDonationCampaignsCached = unstable_cache(
  async () => getActiveDonationCampaigns(),
  ["active-donation-campaigns"],
  { revalidate: REVALIDATE_SECONDS, tags: ["donations"] }
);

export const getDonationCampaignByIdCached = cache(async (campaignId: string) => {
  return unstable_cache(
    async () => getDonationCampaignById(campaignId),
    ["donation-campaign-by-id", campaignId],
    { revalidate: REVALIDATE_SECONDS, tags: [`donation-campaign-${campaignId}`] }
  )();
});
