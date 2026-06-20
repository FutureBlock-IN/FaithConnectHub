import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import type { FirebaseFavorite } from "@/types/firebase-favorite";

import {
  FAVORITES_COLLECTION,
  normalizeFavoriteFromFirestore,
} from "./favorite-firestore";
import { db } from "./firebase";

function sortFavoritesByCreatedAtDesc(
  favorites: FirebaseFavorite[]
): FirebaseFavorite[] {
  return [...favorites].sort((a, b) => b.createdAt - a.createdAt);
}

export function subscribeToUserFavorites(
  userId: string,
  onChange: (favorites: FirebaseFavorite[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // Single-field filter only — avoids composite index while indexes are building.
  const favoritesQuery = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    favoritesQuery,
    (snapshot) => {
      const favorites = snapshot.docs.map((docSnap) =>
        normalizeFavoriteFromFirestore(
          docSnap.id,
          docSnap.data() as Record<string, unknown>
        )
      );
      onChange(sortFavoritesByCreatedAtDesc(favorites));
    },
    (error) => {
      console.error("[subscribeToUserFavorites]", error);
      onError?.(error);
    }
  );
}
