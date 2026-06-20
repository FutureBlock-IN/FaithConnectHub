export type FavoriteItemType = "song" | "sermon" | "article";

export type FirebaseFavorite = {
  id: string;
  userId: string;
  itemId: string;
  itemType: FavoriteItemType;
  createdAt: number;
};

export type FavoriteToggleInput = {
  itemId: string;
  itemType: FavoriteItemType;
};
