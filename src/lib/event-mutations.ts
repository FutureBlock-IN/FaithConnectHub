import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import type { CreateEventInput, UpdateEventInput } from "@/types/firebase-event";

import {
  buildEventCreatePayload,
  EVENTS_COLLECTION,
} from "./event-firestore";
import { db } from "./firebase";
import { wrapFirebaseError } from "./firebase-utils";

/**
 * Client-side Firestore writes — must run in the browser with Firebase Auth
 * so security rules see request.auth (server actions do not attach auth).
 */
export async function createEvent(input: CreateEventInput): Promise<string> {
  const payload = buildEventCreatePayload(input);
  const now = Timestamp.now();

  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function updateEvent(
  eventId: string,
  updates: UpdateEventInput
): Promise<void> {
  try {
    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  } catch (error) {
    wrapFirebaseError(error);
  }
}
