"use client";

import { useQuery } from "@tanstack/react-query";

import { firebaseAuth } from "@/lib/firebase-auth-service";
import type { SubscriptionSnapshot } from "@/types/subscription";

async function fetchSubscription(
  churchId: string
): Promise<SubscriptionSnapshot> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  const response = await fetch(
    `/api/subscription?churchId=${encodeURIComponent(churchId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to load subscription");
  }

  return response.json() as Promise<SubscriptionSnapshot>;
}

export function useSubscriptionQuery(churchId: string | null | undefined) {
  const enabled = Boolean(churchId);

  return useQuery({
    queryKey: ["subscription", churchId],
    queryFn: () => fetchSubscription(churchId!),
    enabled,
    staleTime: 30_000,
  });
}
