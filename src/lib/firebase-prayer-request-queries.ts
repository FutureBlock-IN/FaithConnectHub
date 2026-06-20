"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import type {
  FirebasePrayerRequest,
} from "@/types/firebase-prayer-request";

import { getAdminDb } from "./firebase-admin";
import { db } from "./firebase";
import {
  getFirebaseErrorMessage,
  isFirebaseIndexError,
  isFirebasePermissionError,
  isRecoverableAdminError,
  wrapFirebaseError,
} from "./firebase-utils";
import {
  normalizePrayerRequestFromFirestore,
  PRAYER_REQUESTS_COLLECTION,
} from "./prayer-request-firestore";

function normalizePrayerRequest(
  id: string,
  data: Record<string, unknown>
): FirebasePrayerRequest {
  return normalizePrayerRequestFromFirestore(id, data);
}

async function fetchAllPrayerRequests(): Promise<FirebasePrayerRequest[]> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(PRAYER_REQUESTS_COLLECTION)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((docSnap) =>
        normalizePrayerRequest(
          docSnap.id,
          docSnap.data() as Record<string, unknown>
        )
      );
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const q = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      normalizePrayerRequest(
        docSnap.id,
        docSnap.data() as Record<string, unknown>
      )
    );
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, PRAYER_REQUESTS_COLLECTION));
      return snapshot.docs
        .map((docSnap) =>
          normalizePrayerRequest(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        )
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch (innerError) {
      wrapFirebaseError(innerError);
    }
  }
}

async function fetchApprovedPrayerRequests(): Promise<FirebasePrayerRequest[]> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(PRAYER_REQUESTS_COLLECTION)
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((docSnap) =>
        normalizePrayerRequest(
          docSnap.id,
          docSnap.data() as Record<string, unknown>
        )
      );
    } catch (error) {
      if (isFirebaseIndexError(error)) {
        console.warn(
          "[Firebase] Admin approved prayer index missing, retrying without orderBy:",
          getFirebaseErrorMessage(error)
        );

        try {
          const snapshot = await adminDb
            .collection(PRAYER_REQUESTS_COLLECTION)
            .where("status", "==", "approved")
            .get();

          return snapshot.docs
            .map((docSnap) =>
              normalizePrayerRequest(
                docSnap.id,
                docSnap.data() as Record<string, unknown>
              )
            )
            .sort((a, b) => b.createdAt - a.createdAt);
        } catch (retryError) {
          if (!isRecoverableAdminError(retryError)) {
            wrapFirebaseError(retryError);
          }
          console.warn(
            "[Firebase] Admin SDK unavailable, using client SDK:",
            retryError
          );
        }
      } else if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      } else {
        console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
      }
    }
  }

  try {
    const q = query(
      collection(db, PRAYER_REQUESTS_COLLECTION),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      normalizePrayerRequest(
        docSnap.id,
        docSnap.data() as Record<string, unknown>
      )
    );
  } catch (error) {
    if (isFirebaseIndexError(error)) {
      console.warn(
        "[Firebase] Approved prayer index missing, retrying without orderBy:",
        getFirebaseErrorMessage(error)
      );

      try {
        const fallbackQuery = query(
          collection(db, PRAYER_REQUESTS_COLLECTION),
          where("status", "==", "approved")
        );
        const snapshot = await getDocs(fallbackQuery);
        return snapshot.docs
          .map((docSnap) =>
            normalizePrayerRequest(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
          .sort((a, b) => b.createdAt - a.createdAt);
      } catch (fallbackError) {
        if (
          isFirebasePermissionError(fallbackError) ||
          isFirebaseIndexError(fallbackError)
        ) {
          console.warn(
            "[Firebase] Unable to read approved prayer requests:",
            getFirebaseErrorMessage(fallbackError)
          );
          return [];
        }
        wrapFirebaseError(fallbackError);
      }
    }

    if (isFirebasePermissionError(error)) {
      console.warn(
        "[Firebase] Unable to read approved prayer requests:",
        getFirebaseErrorMessage(error)
      );
      return [];
    }

    wrapFirebaseError(error);
  }
}

export async function getPrayerRequests(): Promise<FirebasePrayerRequest[]> {
  return fetchAllPrayerRequests();
}

export async function getApprovedPrayerRequests(): Promise<
  FirebasePrayerRequest[]
> {
  return fetchApprovedPrayerRequests();
}

export async function getLatestApprovedPrayerRequests(
  limit = 3
): Promise<FirebasePrayerRequest[]> {
  const approved = await fetchApprovedPrayerRequests();
  return approved.slice(0, limit);
}

export async function getPrayerRequestById(
  requestId: string
): Promise<FirebasePrayerRequest | null> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(PRAYER_REQUESTS_COLLECTION)
        .doc(requestId)
        .get();

      if (!snapshot.exists) return null;

      return normalizePrayerRequest(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const snapshot = await getDoc(
      doc(db, PRAYER_REQUESTS_COLLECTION, requestId)
    );
    if (!snapshot.exists()) return null;

    return normalizePrayerRequest(
      snapshot.id,
      snapshot.data() as Record<string, unknown>
    );
  } catch (error) {
    wrapFirebaseError(error);
  }
}
