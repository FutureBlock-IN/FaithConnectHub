"use client";

import { HeartHandshake, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import { PrayerWallCard } from "@/components/prayer/prayer-wall-card";
import { SubmitPrayerRequestButton } from "@/components/prayer/submit-prayer-request-button";
import { ContentListToolbar } from "@/components/worship/content-list-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApprovedPrayerRequests } from "@/hooks/use-approved-prayer-requests";
import { getPrayerRequestDisplayName } from "@/lib/prayer-request-firestore";
import { PRAYER_CATEGORIES } from "@/lib/prayer-request-validation";

type PrayerRequestsListClientProps = {
  initialRequests: FirebasePrayerRequest[];
};

export function PrayerRequestsListClient({
  initialRequests,
}: PrayerRequestsListClientProps) {
  const { requests, loading } = useApprovedPrayerRequests(initialRequests);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (category !== "all" && request.category !== category) return false;
      if (!query) return true;
      const haystack = [
        request.title,
        request.request,
        getPrayerRequestDisplayName(request),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Submit a request or pray for others in the community.
        </p>
        <SubmitPrayerRequestButton className="w-full rounded-full sm:w-auto" />
      </div>

      {requests.length > 0 ?
        <ContentListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search prayer requests…"
        >
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full min-w-0 sm:w-[10rem] rounded-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PRAYER_CATEGORIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ContentListToolbar>
      : null}

      {loading && requests.length === 0 ?
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      : requests.length === 0 ?
        <div className="overflow-hidden rounded-2xl border border-dashed border-border/60 bg-card/50 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <HeartHandshake className="size-8 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">No approved requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Be the first to share a prayer need with the community.
              </p>
            </div>
            <SubmitPrayerRequestButton variant="outline" className="mt-2 rounded-full" />
          </div>
        </div>
      : filteredRequests.length === 0 ?
        <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No prayer requests match your search.
          </p>
        </div>
      : <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filteredRequests.map((request) => (
            <PrayerWallCard key={request.id} request={request} />
          ))}
        </div>
      }
    </div>
  );
}
