"use client";

import { useActiveChurch } from "@/context/active-church-context";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import {
  getManagedChurchIdForUser,
  isPlatformSuperAdmin,
} from "@/lib/church-access";
import { getLegacyDefaultChurchId } from "@/lib/church-scope";

/** Effective church scope for admin content management. */
export function useAdminChurchId(): string | null {
  const { authUser, profile } = useFirebaseAuth();
  const { activeChurchId } = useActiveChurch();

  const accessUser = {
    email: authUser?.email,
    churchId: profile?.churchId,
    churchRole: profile?.churchRole,
    managedChurchIds: profile?.managedChurchIds,
  };

  if (isPlatformSuperAdmin(authUser?.email)) {
    return activeChurchId ?? (getLegacyDefaultChurchId() || null);
  }

  return getManagedChurchIdForUser(accessUser);
}

export function useIsPlatformSuperAdmin(): boolean {
  const { authUser } = useFirebaseAuth();
  return isPlatformSuperAdmin(authUser?.email);
}
