import type { FavoriteItemType } from "@/types/firebase-favorite";

export type RecentlyViewedItemType = FavoriteItemType;

export type FirebaseRecentlyViewed = {
  id: string;
  userId: string;
  itemId: string;
  itemType: RecentlyViewedItemType;
  viewedAt: number;
};
