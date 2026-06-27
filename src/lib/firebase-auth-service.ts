import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { app, db } from "./firebase";

export const firebaseAuth = getAuth(app);

import type { EmailNotificationPreferences } from "@/lib/email/types";
import { normalizeEmailPreferences } from "@/lib/email/preferences";

export type UserRole = "user" | "admin";

export type ChurchRole = "member" | "admin";

export type FirestoreUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  churchId?: string;
  churchRole?: ChurchRole;
  managedChurchIds?: string[];
  emailPreferences?: EmailNotificationPreferences;
  createdAt: unknown;
};

function mapFirestoreUserData(data: Record<string, unknown>): FirestoreUser {
  return {
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    role: (data.role as UserRole) ?? "user",
    churchId: data.churchId ? String(data.churchId) : undefined,
    churchRole: data.churchRole as ChurchRole | undefined,
    managedChurchIds: Array.isArray(data.managedChurchIds)
      ? data.managedChurchIds.map(String)
      : undefined,
    emailPreferences: data.emailPreferences
      ? normalizeEmailPreferences(data.emailPreferences)
      : undefined,
    createdAt: data.createdAt,
  };
}

async function syncProfileViaApi(
  user: User,
  options?: { firstName?: string; lastName?: string }
): Promise<FirestoreUser> {
  const token = await user.getIdToken();
  const response = await fetch("/api/auth/sync-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      firstName: options?.firstName,
      lastName: options?.lastName,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error ?? "Failed to save user profile.");
  }

  return response.json() as Promise<FirestoreUser>;
}

export async function getUserProfile(
  uid: string
): Promise<FirestoreUser | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    return mapFirestoreUserData(data);
  } catch {
    return null;
  }
}

export async function createOrUpdateUserInFirestore(
  user: User,
  options?: {
    firstName?: string;
    lastName?: string;
  }
): Promise<FirestoreUser> {
  try {
    return await syncProfileViaApi(user, options);
  } catch {
    // Fallback to client Firestore if Admin API is unavailable
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const displayName = user.displayName ?? "";
      const parts = displayName.split(" ");
      const defaultFirst = parts[0] ?? "";
      const defaultLast = parts.slice(1).join(" ");

      const profile = {
        firstName: options?.firstName ?? defaultFirst,
        lastName: options?.lastName ?? defaultLast,
        email: user.email ?? "",
        role: "user" as const,
        createdAt: new Date().toISOString(),
      };

      const { setDoc } = await import("firebase/firestore");
      await setDoc(userRef, profile);
      return profile;
    }

    const data = userSnap.data();
    return mapFirestoreUserData(data);
  }
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const result = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  const profile = await createOrUpdateUserInFirestore(result.user, {
    firstName,
    lastName,
  });
  return { result, profile };
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  const profile = await createOrUpdateUserInFirestore(result.user);
  return { result, profile };
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(firebaseAuth, email);
}

export async function signOutUser() {
  return signOut(firebaseAuth);
}

