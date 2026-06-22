import type {
  FirebaseRecentlyViewed,
  RecentlyViewedItemType,
} from "@/types/firebase-recently-viewed";

import { toMillis } from "./firebase-utils";

export const RECENTLY_VIEWED_COLLECTION = "recentlyViewed";
export const RECENTLY_VIEWED_LIMIT = 20;

const VALID_ITEM_TYPES = new Set<RecentlyViewedItemType>([
  "song",
  "sermon",
  "article",
]);

export function normalizeRecentlyViewedItemType(
  value: unknown
): RecentlyViewedItemType {
  const raw = String(value ?? "").trim() as RecentlyViewedItemType;
  return VALID_ITEM_TYPES.has(raw) ? raw : "song";
}

export function buildRecentlyViewedDocId(
  userId: string,
  itemType: RecentlyViewedItemType,
  itemId: string
): string {
  const safeItemId = itemId.replace(/\//g, "_");
  return `${userId}__${itemType}__${safeItemId}`;
}

export function normalizeRecentlyViewedFromFirestore(
  id: string,
  data: Record<string, unknown>
): FirebaseRecentlyViewed {
  return {
    id,
    userId: String(data.userId ?? "").trim(),
    itemId: String(data.itemId ?? "").trim(),
    itemType: normalizeRecentlyViewedItemType(data.itemType),
    viewedAt: toMillis(data.viewedAt),
  };
}

export function buildRecentlyViewedPayload(
  userId: string,
  itemType: RecentlyViewedItemType,
  itemId: string
) {
  return {
    userId,
    itemId: itemId.trim(),
    itemType,
  };
}

export function getRecentlyViewedContentPath(
  itemType: RecentlyViewedItemType,
  itemId: string
): string {
  const encodedId = encodeURIComponent(itemId.trim());
  switch (itemType) {
    case "song":
      return `/songs/${encodedId}`;
    case "sermon":
      return `/sermons/${encodedId}`;
    case "article":
      return `/articles/${encodedId}`;
  }
}

export function sortRecentlyViewedByViewedAtDesc(
  items: FirebaseRecentlyViewed[]
): FirebaseRecentlyViewed[] {
  return [...items].sort((a, b) => b.viewedAt - a.viewedAt);
}
