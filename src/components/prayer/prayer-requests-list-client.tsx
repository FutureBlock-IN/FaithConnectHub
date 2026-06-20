"use client";

import { HeartHandshake, Loader2 } from "lucide-react";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { PrayerWallCard } from "@/components/prayer/prayer-wall-card";
import { useApprovedPrayerRequests } from "@/hooks/use-approved-prayer-requests";

type PrayerRequestsListClientProps = {
  initialRequests: FirebasePrayerRequest[];
};

export function PrayerRequestsListClient({
  initialRequests,
}: PrayerRequestsListClientProps) {
  const { requests, loading } = useApprovedPrayerRequests(initialRequests);

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-dashed border-border/60 bg-card/50 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <HeartHandshake className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">No approved requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back soon for community prayer requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {requests.map((request) => (
        <PrayerWallCard key={request.id} request={request} />
      ))}
    </div>
  );
}
