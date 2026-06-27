import "server-only";

import { ARTICLES_COLLECTION } from "@/lib/article-firestore";
import { CHURCHES_COLLECTION } from "@/lib/church-firestore";
import { DONATION_CAMPAIGNS_COLLECTION } from "@/lib/donation-firestore";
import { EVENTS_COLLECTION } from "@/lib/event-firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { SERMONS_COLLECTION } from "@/lib/sermon-firestore";
import { SONGS_COLLECTION } from "@/lib/song-firestore";
import type { SubscriptionUsage } from "@/types/subscription";

import { EMPTY_USAGE } from "./limits";

async function countByChurchId(
  collection: string,
  churchId: string
): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(collection)
    .where("churchId", "==", churchId)
    .count()
    .get();

  return snap.data().count;
}

async function countMembers(churchId: string): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection("users")
    .where("churchId", "==", churchId)
    .count()
    .get();

  return snap.data().count;
}

async function countAdmins(churchId: string): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection("users")
    .where("churchId", "==", churchId)
    .where("churchRole", "==", "admin")
    .count()
    .get();

  return snap.data().count;
}

async function countChurches(): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 1;

  const snap = await adminDb
    .collection(CHURCHES_COLLECTION)
    .where("isActive", "==", true)
    .count()
    .get();

  return Math.max(1, snap.data().count);
}

/** Compute live usage for a church tenant. */
export async function computeChurchUsage(
  churchId: string
): Promise<SubscriptionUsage> {
  if (!churchId.trim()) return { ...EMPTY_USAGE };

  try {
    const [
      members,
      songs,
      sermons,
      articles,
      churches,
      admins,
      events,
      donationCampaigns,
    ] = await Promise.all([
      countMembers(churchId),
      countByChurchId(SONGS_COLLECTION, churchId),
      countByChurchId(SERMONS_COLLECTION, churchId),
      countByChurchId(ARTICLES_COLLECTION, churchId),
      countChurches(),
      countAdmins(churchId),
      countByChurchId(EVENTS_COLLECTION, churchId),
      countByChurchId(DONATION_CAMPAIGNS_COLLECTION, churchId),
    ]);

    return {
      members,
      songs,
      sermons,
      articles,
      churches,
      admins,
      events,
      donationCampaigns,
    };
  } catch (error) {
    console.error("[subscription] usage compute failed:", error);
    return { ...EMPTY_USAGE };
  }
}
