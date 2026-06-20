import { Timestamp } from "firebase/firestore";

export const FIREBASE_PERMISSION_HELP =
  "Firebase permission denied. Deploy firestore.rules (run: firebase deploy --only firestore:rules,storage) or publish rules in Firebase Console. If using a service account, ensure firebase-service-account.json is for project faithconnecthub-a4e6b.";

export function isRecoverableAdminError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("PERMISSION_DENIED") ||
    message.includes("permission") ||
    message.includes("UNAUTHENTICATED") ||
    message.includes("invalid_grant")
  );
}

export function isFirebasePermissionError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("PERMISSION_DENIED") ||
    message.includes("Missing or insufficient permissions") ||
    message.includes("permission")
  );
}

export function isFirebaseIndexError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("FAILED_PRECONDITION") ||
    message.includes("requires an index")
  );
}

export function getFirebaseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

export function toMillis(value: unknown): number {
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

export function wrapFirebaseError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Unknown Firebase error";

  if (message.includes("PERMISSION_DENIED") || message.includes("permission")) {
    throw new Error(FIREBASE_PERMISSION_HELP);
  }

  throw error instanceof Error ? error : new Error(message);
}
