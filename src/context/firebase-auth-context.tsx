"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import {
  createOrUpdateUserInFirestore,
  firebaseAuth,
  getUserProfile,
  signOutUser,
  type FirestoreUser,
} from "@/lib/firebase-auth-service";
import { resolveIsAdmin } from "@/lib/admin-access";
import {
  AUTH_ADMIN_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
} from "@/lib/auth-cookies";

/** Normalized Firebase auth user exposed to the app */
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type FirebaseAuthContextType = {
  user: User | null;
  authUser: AuthUser | null;
  profile: FirestoreUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const FirebaseAuthContext = React.createContext<FirebaseAuthContextType>({
  user: null,
  authUser: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME, AUTH_ADMIN_COOKIE_NAME } from "@/lib/auth-cookies";

export function setAuthCookie(
  authenticated: boolean,
  options?: { role?: string; isAdmin?: boolean }
) {
  if (typeof document === "undefined") return;

  if (authenticated) {
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (options?.role) {
      document.cookie = `${AUTH_ROLE_COOKIE_NAME}=${options.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    if (options?.isAdmin) {
      document.cookie = `${AUTH_ADMIN_COOKIE_NAME}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      document.cookie = `${AUTH_ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${AUTH_ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function toAuthUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

async function resolveFirebaseUser(firebaseUser: User): Promise<User> {
  if (firebaseUser.photoURL) return firebaseUser;

  const isGoogle = firebaseUser.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  if (!isGoogle) return firebaseUser;

  try {
    await firebaseUser.reload();
    return firebaseAuth.currentUser ?? firebaseUser;
  } catch {
    return firebaseUser;
  }
}

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<User | null>(null);
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [profile, setProfile] = React.useState<FirestoreUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const resolvedUser = await resolveFirebaseUser(firebaseUser);
          setUser(resolvedUser);
          setAuthUser(toAuthUser(resolvedUser));

          let userProfile = await getUserProfile(resolvedUser.uid);

          if (!userProfile) {
            userProfile = await createOrUpdateUserInFirestore(resolvedUser);
          }

          setProfile(userProfile);

          const adminAccess = resolveIsAdmin(resolvedUser.email);
          setIsAdmin(adminAccess);
          setAuthCookie(true, {
            role: userProfile?.role ?? "user",
            isAdmin: adminAccess,
          });
        } catch {
          setUser(firebaseUser);
          setAuthUser(toAuthUser(firebaseUser));
          setProfile(null);

          const adminAccess = resolveIsAdmin(firebaseUser.email);
          setIsAdmin(adminAccess);
          setAuthCookie(true, { role: "user", isAdmin: adminAccess });
        }
      } else {
        setUser(null);
        setAuthUser(null);
        setProfile(null);
        setIsAdmin(false);
        setAuthCookie(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = React.useCallback(async () => {
    await signOutUser();
    setUser(null);
    setAuthUser(null);
    setProfile(null);
    setIsAdmin(false);
    setAuthCookie(false);
  }, []);

  return (
    <FirebaseAuthContext.Provider
      value={{ user, authUser, profile, isAdmin, loading, signOut }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return React.useContext(FirebaseAuthContext);
}
