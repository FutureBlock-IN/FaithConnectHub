"use client";

import { useFirebaseAuth } from "@/context/firebase-auth-context";

/** Convenience hook for inline admin gating on public pages. */
export function useIsAdmin(): boolean {
  return useFirebaseAuth().isAdmin;
}
