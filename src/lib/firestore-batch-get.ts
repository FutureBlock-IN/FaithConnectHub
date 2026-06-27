import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const FIRESTORE_IN_QUERY_LIMIT = 30;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function getFirestoreDocsByIds<T>(
  collectionName: string,
  ids: string[],
  normalize: (id: string, data: Record<string, unknown>) => T
): Promise<T[]> {
  if (ids.length === 0) return [];

  const uniqueIds = [...new Set(ids)];
  const results = await Promise.all(
    chunk(uniqueIds, FIRESTORE_IN_QUERY_LIMIT).map(async (idChunk) => {
      const snapshot = await getDocs(
        query(
          collection(db, collectionName),
          where(documentId(), "in", idChunk)
        )
      );

      return snapshot.docs.map((docSnap) =>
        normalize(docSnap.id, docSnap.data() as Record<string, unknown>)
      );
    })
  );

  return results.flat();
}
