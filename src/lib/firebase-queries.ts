"use server";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";

import type {
  CreateSongInput,
  FirebaseSong,
  UpdateSongInput,
} from "@/types/firebase-song";

import { getAdminDb, isAdminConfigured } from "./firebase-admin";
import { db } from "./firebase";
import {
  filterPublishedSongs,
  normalizeSongFromFirestore,
  toSongFirestorePayload,
} from "./song-firestore";
import { isRecoverableAdminError, wrapFirebaseError } from "./firebase-utils";

const SONGS_COLLECTION = "songs";

function toMillis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: () => number }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === "number") {
    return value;
  }
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }
  return Date.now();
}

// function normalizeSong(
//   id: string,
//   data: Record<string, unknown>
// ): FirebaseSong {
//   const rawAudio = String(data.audioUrl ?? data.audioFileUrl ?? "").trim();
//   const rawImage = String(data.imageUrl ?? data.coverImageUrl ?? "").trim();
//   const rawYoutube = String(data.youtubeUrl ?? data.videoUrl ?? "").trim();

//   return {
//     id,
//     title: String(data.title ?? ""),
//     lyrics: String(data.lyrics ?? data.teluguLyrics ?? ""),
//     transliteratedLyrics: String(
//       data.transliteratedLyrics ?? data.englishLyrics ?? ""
//     ),
//     imageUrl: rawImage || undefined,
//     audioUrl: rawAudio || undefined,
//     youtubeUrl: rawYoutube || undefined,
//     createdAt: toMillis(data.createdAt),
//   };
// }

function normalizeSong(id: string, data: Record<string, unknown>): FirebaseSong {
  return normalizeSongFromFirestore(id, data);
}

async function fetchAllSongs(): Promise<FirebaseSong[]> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(SONGS_COLLECTION)
        .orderBy("createdAt", "desc")
        .get();

      const songs = snapshot.docs.map((docSnap) =>
        normalizeSong(docSnap.id, docSnap.data() as Record<string, unknown>)
      );
      return songs;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const q = query(
      collection(db, SONGS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const songs = snapshot.docs.map((docSnap) =>
      normalizeSong(docSnap.id, docSnap.data() as Record<string, unknown>)
    );
    return songs;
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, SONGS_COLLECTION));
      const songs = snapshot.docs
        .map((docSnap) =>
          normalizeSong(docSnap.id, docSnap.data() as Record<string, unknown>)
        )
        .sort((a, b) => b.createdAt - a.createdAt);
      return songs;
    } catch (innerError) {
      wrapFirebaseError(innerError);
    }
  }
}

export async function getAllSongs(): Promise<FirebaseSong[]> {
  return fetchAllSongs();
}

export async function getPublishedSongs(): Promise<FirebaseSong[]> {
  const songs = await fetchAllSongs();
  return filterPublishedSongs(songs);
}

// ── incrementPlayCount ────────────────────────────────────────────────────────
export async function incrementPlayCount(songId: string): Promise<void> {
  if (!songId?.trim()) return;
  try {
    await updateDoc(doc(db, SONGS_COLLECTION, songId), {
      playCount: increment(1),
    });
  } catch (error) {
    console.warn("[incrementPlayCount] Failed:", error);
  }
}

async function fetchSongById(songId: string): Promise<FirebaseSong | null> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(SONGS_COLLECTION)
        .doc(songId)
        .get();

      if (!snapshot.exists) {
        return null;
      }

      const song = normalizeSong(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
      return song;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const songRef = doc(db, SONGS_COLLECTION, songId);
    const snapshot = await getDoc(songRef);

    if (!snapshot.exists()) {
      return null;
    }

    const song = normalizeSong(
      snapshot.id,
      snapshot.data() as Record<string, unknown>
    );
    return song;
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function getSongById(songId: string): Promise<FirebaseSong | null> {
  return fetchSongById(songId);
}

// export async function searchSongs(searchQuery: string): Promise<FirebaseSong[]> {
//   const normalized = searchQuery.trim().toLowerCase();
//   if (!normalized) return [];

//   const songs = await getAllSongs();
//   return songs.filter((song) => song.title.toLowerCase().includes(normalized));
// }

// ── 2. Update searchSongs function ───────────────────────────────
// Find searchSongs and update the filter to search all three title fields:
 
export async function searchSongs(searchQuery: string): Promise<FirebaseSong[]> {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return [];

  const songs = await getPublishedSongs();
  return songs.filter((song) => {
    const haystack = [
      song.songTitle,
      song.alternateTitle ?? "",
      song.artist ?? "",
      song.category,
      song.scriptureReference ?? "",
      ...song.tags,
      song.title,
      song.englishTitle ?? "",
      song.teluguTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export async function addSong(songData: CreateSongInput): Promise<string> {
  const payload = toSongFirestorePayload({
    ...songData,
    category: songData.category ?? "Worship",
    featured: songData.featured ?? false,
    published: songData.published ?? true,
    tags: songData.tags ?? [],
  });

  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      console.log("[Firebase] Adding song (admin):", {
        title: songData.songTitle,
      });
      const docRef = await adminDb.collection(SONGS_COLLECTION).add({
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log("[Firebase] Song added (admin):", docRef.id);
      return docRef.id;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    console.log("[Firebase] Adding song (client):", {
      title: songData.songTitle,
    });
    const docRef = await addDoc(collection(db, SONGS_COLLECTION), {
      ...payload,
      createdAt: Timestamp.now(),
    });
    console.log("[Firebase] Song added (client):", docRef.id);
    return docRef.id;
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function updateSong(
  songId: string,
  updates: UpdateSongInput
): Promise<void> {
  const payload = toSongFirestorePayload(updates);
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      console.log("[Firebase] Updating song (admin):", {
        songId,
        updates: Object.keys(payload),
      });
      await adminDb.collection(SONGS_COLLECTION).doc(songId).update(payload);
      console.log("[Firebase] Song updated (admin):", songId);
      return;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    console.log("[Firebase] Updating song (client):", {
      songId,
      updates: Object.keys(payload),
    });
    const songRef = doc(db, SONGS_COLLECTION, songId);
    await updateDoc(songRef, payload);
    console.log("[Firebase] Song updated (client):", songId);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function deleteSong(songId: string): Promise<void> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      console.log("[Firebase] Deleting song from Firestore:", songId);
      await adminDb.collection(SONGS_COLLECTION).doc(songId).delete();
      console.log("[Firebase] Song deleted successfully:", songId);
      return;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    console.log("[Firebase] Deleting song from Firestore (client):", songId);
    const songRef = doc(db, SONGS_COLLECTION, songId);
    await deleteDoc(songRef);
    console.log("[Firebase] Song deleted successfully (client):", songId);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function isUsingFirebaseAdmin(): Promise<boolean> {
  return isAdminConfigured();
}


