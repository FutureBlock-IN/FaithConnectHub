import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import type { ChurchSubscription, SubscriptionSnapshot } from "@/types/subscription";

import { resolveFeatureFlagsFromSubscription } from "./features";
import {
  buildUsageChecks,
  getPlanLimits,
} from "./limits";
import { getPlan } from "./plans";
import {
  buildDefaultSubscription,
  normalizeSubscriptionFromFirestore,
  SUBSCRIPTIONS_COLLECTION,
} from "./subscription-firestore";
import { computeChurchUsage } from "./usage-server";

export async function getSubscriptionByChurchId(
  churchId: string
): Promise<ChurchSubscription> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    return buildDefaultSubscription(churchId);
  }

  try {
    const snap = await adminDb
      .collection(SUBSCRIPTIONS_COLLECTION)
      .doc(churchId)
      .get();

    if (!snap.exists) {
      return buildDefaultSubscription(churchId);
    }

    return normalizeSubscriptionFromFirestore(
      snap.id,
      snap.data() as Record<string, unknown>
    );
  } catch (error) {
    console.error("[subscription] read failed:", error);
    return buildDefaultSubscription(churchId);
  }
}

export async function getSubscriptionSnapshot(
  churchId: string
): Promise<SubscriptionSnapshot> {
  const subscription = await getSubscriptionByChurchId(churchId);
  const plan = getPlan(subscription.planId);
  const limits = getPlanLimits(subscription.planId);
  const features = resolveFeatureFlagsFromSubscription(subscription);
  const usage = await computeChurchUsage(churchId);
  const usageChecks = buildUsageChecks(usage, limits);

  return {
    subscription,
    plan,
    features,
    limits,
    usage,
    usageChecks,
  };
}

export async function ensureSubscriptionDocument(
  churchId: string
): Promise<ChurchSubscription> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    return buildDefaultSubscription(churchId);
  }

  const ref = adminDb.collection(SUBSCRIPTIONS_COLLECTION).doc(churchId);
  const snap = await ref.get();

  if (snap.exists) {
    return normalizeSubscriptionFromFirestore(
      snap.id,
      snap.data() as Record<string, unknown>
    );
  }

  const payload = buildDefaultSubscription(churchId);
  await ref.set({
    churchId,
    planId: payload.planId,
    status: payload.status,
    cancelAtPeriodEnd: false,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  });

  return payload;
}
