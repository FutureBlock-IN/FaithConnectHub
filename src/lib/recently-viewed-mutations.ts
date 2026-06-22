import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import type { RecentlyViewedItemType } from "@/types/firebase-recently-viewed";

import {
  buildRecentlyViewedDocId,
  buildRecentlyViewedPayload,
  RECENTLY_VIEWED_COLLECTION,
  RECENTLY_VIEWED_LIMIT,
} from "./recently-viewed-firestore";
import { db } from "./firebase";
import { wrapFirebaseError } from "./firebase-utils";

export async function recordRecentlyViewed(
  userId: string,
  itemType: RecentlyViewedItemType,
  itemId: string
): Promise<void> {
  const trimmedId = itemId.trim();
  if (!trimmedId) return;

  const docId = buildRecentlyViewedDocId(userId, itemType, trimmedId);
  const payload = buildRecentlyViewedPayload(userId, itemType, trimmedId);

  try {
    await setDoc(
      doc(db, RECENTLY_VIEWED_COLLECTION, docId),
      {
        ...payload,
        viewedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await trimRecentlyViewedForUser(userId);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

/** @deprecated Use recordRecentlyViewed */
export const trackRecentlyViewedItem = recordRecentlyViewed;

async function trimRecentlyViewedForUser(userId: string): Promise<void> {
  const recentlyViewedQuery = query(
    collection(db, RECENTLY_VIEWED_COLLECTION),
    where("userId", "==", userId),
    orderBy("viewedAt", "desc")
  );

  const snapshot = await getDocs(recentlyViewedQuery);
  const extras = snapshot.docs.slice(RECENTLY_VIEWED_LIMIT);

  if (extras.length === 0) return;

  await Promise.all(extras.map((docSnap) => deleteDoc(docSnap.ref)));
}
