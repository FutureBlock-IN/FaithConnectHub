import type { Metadata } from "next";

import { DonationsListClient } from "@/components/donations/donations-list-client";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getActiveDonationCampaignsCached } from "@/lib/cached-donation-data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Donation Campaigns",
  description:
    "Support Christian ministry through secure online giving on FaithConnectHub. Browse active donation campaigns and contribute with transparency.",
  path: "/donations",
  keywords: ["Christian donations", "online giving", "ministry support", "church donations"],
});

export default async function DonationsPage() {
  const { churchId } = await getPageChurchContext();
  const campaigns = await getActiveDonationCampaignsCached(churchId);

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-10 pt-2 sm:space-y-8"
      aria-labelledby="donations-heading"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Give
        </p>
        <h1 id="donations-heading" className="font-heading text-2xl font-bold sm:text-3xl">
          Donations
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Support active ministry campaigns with secure, transparent giving.
        </p>
      </header>

      <DonationsListClient initialCampaigns={campaigns} />
    </section>
  );
}
