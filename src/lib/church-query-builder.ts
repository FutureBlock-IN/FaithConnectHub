import type { Firestore as AdminFirestore } from "firebase-admin/firestore";
import {
  query,
  where,
  orderBy,
  type CollectionReference,
  type DocumentData,
  type Query,
} from "firebase/firestore";

/** Client SDK — church-scoped ordered query. */
export function buildChurchScopedQuery(
  col: CollectionReference<DocumentData>,
  churchId: string,
  orderField: string,
  direction: "asc" | "desc" = "desc"
): Query<DocumentData> {
  return query(
    col,
    where("churchId", "==", churchId),
    orderBy(orderField, direction)
  );
}

/** Admin SDK — church-scoped ordered query. */
export function buildAdminChurchScopedQuery(
  adminDb: AdminFirestore,
  collectionName: string,
  churchId: string,
  orderField: string,
  direction: "asc" | "desc" = "desc"
) {
  return adminDb
    .collection(collectionName)
    .where("churchId", "==", churchId)
    .orderBy(orderField, direction);
}

export function appendChurchIdToPayload<T extends Record<string, unknown>>(
  payload: T,
  churchId: string
): T & { churchId: string } {
  return { ...payload, churchId };
}
