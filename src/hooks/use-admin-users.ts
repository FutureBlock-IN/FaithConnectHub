"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { normalizeUserCreatedAt } from "@/lib/admin-analytics-utils";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
import { db } from "@/lib/firebase";
import { useAdminChurchId, useIsPlatformSuperAdmin } from "@/hooks/use-admin-church-id";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: number;
};

function mapUserDocToRow(id: string, data: Record<string, unknown>): AdminUserRow {
  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Member";

  return {
    id,
    name,
    email: String(data.email ?? "").trim(),
    role: String(data.role ?? "user").trim(),
    createdAt: normalizeUserCreatedAt(data.createdAt),
  };
}

export function useAdminUsers() {
  const adminChurchId = useAdminChurchId();
  const isSuperAdmin = useIsPlatformSuperAdmin();
  const churchScope = MULTI_CHURCH_ENABLED
    ? isSuperAdmin ? null : adminChurchId
    : null;

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MULTI_CHURCH_ENABLED && !isSuperAdmin && !churchScope) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (churchScope && MULTI_CHURCH_ENABLED) {
      constraints.unshift(where("churchId", "==", churchScope));
    }

    const usersQuery = query(collection(db, "users"), ...constraints);

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(
          snapshot.docs.map((docSnap) =>
            mapUserDocToRow(docSnap.id, docSnap.data() as Record<string, unknown>)
          )
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [churchScope, isSuperAdmin]);

  return { users, loading };
}
