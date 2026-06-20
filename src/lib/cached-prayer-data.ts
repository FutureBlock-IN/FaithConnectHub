import { unstable_cache } from "next/cache";

import type { FirebasePrayerRequest } from "@/types/firebase-prayer-request";

import {
  getApprovedPrayerRequests,
  getLatestApprovedPrayerRequests,
} from "./firebase-prayer-request-queries";

export async function getApprovedPrayerRequestsCached(
  churchId: string
): Promise<FirebasePrayerRequest[]> {
  return unstable_cache(
    async () => getApprovedPrayerRequests(churchId),
    ["approved-prayer-requests", churchId],
    { revalidate: 60, tags: ["prayer-requests", `church-${churchId}`] }
  )();
}

export async function getLatestApprovedPrayerRequestsCached(
  churchId: string,
  limit = 3
): Promise<FirebasePrayerRequest[]> {
  return unstable_cache(
    async () => getLatestApprovedPrayerRequests(churchId, limit),
    ["latest-approved-prayer-requests", churchId, String(limit)],
    { revalidate: 60, tags: ["prayer-requests", `church-${churchId}`] }
  )();
}
