import type { Firestore as AdminFirestore } from "firebase-admin/firestore";
import {
  query,
  where,
  orderBy,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryConstraint,
} from "firebase/firestore";

import { MULTI_CHURCH_ENABLED } from "./feature-flags";

/** Client SDK — church-scoped ordered query. */
export function buildChurchScopedQuery(
  col: CollectionReference<DocumentData>,
  churchId: string,
  orderField: string,
  direction: "asc" | "desc" = "desc"
): Query<DocumentData> {
  if (!MULTI_CHURCH_ENABLED || !churchId.trim()) {
    return query(col, orderBy(orderField, direction));
  }

  return query(
    col,
    where("churchId", "==", churchId),
    orderBy(orderField, direction)
  );
}

/** Client SDK — optional church scope plus additional constraints. */
export function buildClientScopedQuery(
  col: CollectionReference<DocumentData>,
  churchId: string | null | undefined,
  ...constraints: QueryConstraint[]
): Query<DocumentData> {
  const allConstraints: QueryConstraint[] = [];

  if (MULTI_CHURCH_ENABLED && churchId) {
    allConstraints.push(where("churchId", "==", churchId));
  }

  allConstraints.push(...constraints);
  return query(col, ...allConstraints);
}

/** Admin SDK — church-scoped ordered query. */
export function buildAdminChurchScopedQuery(
  adminDb: AdminFirestore,
  collectionName: string,
  churchId: string,
  orderField: string,
  direction: "asc" | "desc" = "desc"
) {
  const collectionRef = adminDb.collection(collectionName);

  if (!MULTI_CHURCH_ENABLED || !churchId.trim()) {
    return collectionRef.orderBy(orderField, direction);
  }

  return collectionRef
    .where("churchId", "==", churchId)
    .orderBy(orderField, direction);
}

export function appendChurchIdToPayload<T extends Record<string, unknown>>(
  payload: T,
  churchId: string
): T & { churchId: string } {
  return { ...payload, churchId };
}
