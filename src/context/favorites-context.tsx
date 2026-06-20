"use client";

import React from "react";

import type {
  FavoriteItemType,
  FirebaseFavorite,
} from "@/types/firebase-favorite";

import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { addFavorite, removeFavorite } from "@/lib/favorite-mutations";
import { getFavoriteLookupKey } from "@/lib/favorite-firestore";
import { subscribeToUserFavorites } from "@/lib/favorite-queries";

type FavoritesContextValue = {
  favorites: FirebaseFavorite[];
  loading: boolean;
  isFavorited: (itemType: FavoriteItemType, itemId: string) => boolean;
  toggleFavorite: (
    itemType: FavoriteItemType,
    itemId: string
  ) => Promise<void>;
};

const FavoritesContext = React.createContext<FavoritesContextValue | null>(
  null
);

export function FavoritesProvider({ children }: React.PropsWithChildren) {
  const { user } = useFirebaseAuth();
  const [favorites, setFavorites] = React.useState<FirebaseFavorite[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserFavorites(
      user.uid,
      (items) => {
        setFavorites(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [user?.uid]);

  const favoriteKeys = React.useMemo(
    () =>
      new Set(
        favorites.map((favorite) =>
          getFavoriteLookupKey(favorite.itemType, favorite.itemId)
        )
      ),
    [favorites]
  );

  const isFavorited = React.useCallback(
    (itemType: FavoriteItemType, itemId: string) =>
      favoriteKeys.has(getFavoriteLookupKey(itemType, itemId)),
    [favoriteKeys]
  );

  const toggleFavorite = React.useCallback(
    async (itemType: FavoriteItemType, itemId: string) => {
      if (!user?.uid) return;

      const trimmedId = itemId.trim();
      if (!trimmedId) return;

      if (isFavorited(itemType, trimmedId)) {
        await removeFavorite(user.uid, itemType, trimmedId);
        return;
      }

      await addFavorite(user.uid, itemType, trimmedId);
    },
    [user?.uid, isFavorited]
  );

  const value = React.useMemo(
    () => ({
      favorites,
      loading,
      isFavorited,
      toggleFavorite,
    }),
    [favorites, loading, isFavorited, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
