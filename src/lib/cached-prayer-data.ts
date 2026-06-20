import { unstable_cache } from "next/cache";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import {
  getApprovedPrayerRequests,
  getLatestApprovedPrayerRequests,
} from "./firebase-prayer-request-queries";

export const getApprovedPrayerRequestsCached = unstable_cache(
  async (): Promise<FirebasePrayerRequest[]> => getApprovedPrayerRequests(),
  ["approved-prayer-requests"],
  { revalidate: 60, tags: ["prayer-requests"] }
);

export const getLatestApprovedPrayerRequestsCached = unstable_cache(
  async (limit = 3): Promise<FirebasePrayerRequest[]> =>
    getLatestApprovedPrayerRequests(limit),
  ["latest-approved-prayer-requests"],
  { revalidate: 60, tags: ["prayer-requests"] }
);
