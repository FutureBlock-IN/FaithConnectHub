import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  runTransaction,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import type { PrayerRequestStatus } from "@/types/firebase-prayer-request";

import { db } from "./firebase";
import {
  buildPrayerRequestCreatePayload,
  PRAYER_REQUESTS_COLLECTION,
} from "./prayer-request-firestore";
import { wrapFirebaseError } from "./firebase-utils";
import {
  sanitizePrayerRequestInput,
  type PrayerRequestSubmitValues,
} from "./prayer-request-validation";

/**
 * Client-side Firestore writes — must run in the browser with Firebase Auth
 * so security rules see request.auth (server actions do not attach auth).
 */
export async function createPrayerRequest(
  churchId: string,
  userId: string,
  values: PrayerRequestSubmitValues,
  options?: { email?: string | null }
): Promise<string> {
  const sanitized = sanitizePrayerRequestInput(values);
  const payload = buildPrayerRequestCreatePayload({
    ...sanitized,
    churchId,
    userId,
    email: sanitized.email ?? options?.email?.trim() ?? undefined,
  });
  const now = Timestamp.now();

  try {
    const docRef = await addDoc(collection(db, PRAYER_REQUESTS_COLLECTION), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    wrapFirebaseError(error);
  }
}

async function updatePrayerCountByDelta(
  requestId: string,
  delta: 1 | -1
): Promise<void> {
  const ref = doc(db, PRAYER_REQUESTS_COLLECTION, requestId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      throw new Error("Prayer request not found");
    }

    const data = snapshot.data();
    if (data.status !== "approved") {
      throw new Error("Prayer request is not available");
    }

    const current = Number(data.prayerCount ?? 0) || 0;
    const next = current + delta;

    if (next < 0) {
      throw new Error("Prayer count cannot be negative");
    }

    transaction.update(ref, {
      prayerCount: next,
      updatedAt: Timestamp.now(),
    });
  });
}

export async function incrementPrayerCount(requestId: string): Promise<void> {
  if (!requestId.trim()) {
    throw new Error("Prayer request id is required");
  }

  try {
    await updatePrayerCountByDelta(requestId, 1);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function decrementPrayerCount(requestId: string): Promise<void> {
  if (!requestId.trim()) {
    throw new Error("Prayer request id is required");
  }

  try {
    await updatePrayerCountByDelta(requestId, -1);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function updatePrayerRequestStatus(
  requestId: string,
  status: PrayerRequestStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, PRAYER_REQUESTS_COLLECTION, requestId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function deletePrayerRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRAYER_REQUESTS_COLLECTION, requestId));
  } catch (error) {
    wrapFirebaseError(error);
  }
}
