import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import type {
  FirebaseNotification,
  NotificationContentType,
} from "@/types/firebase-notification";

import { db } from "@/lib/firebase";

const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Central per-type presets. Adding a new channel (e.g. email) later only needs
 * to read these same values, so content stays consistent across channels.
 */
export const NOTIFICATION_PRESETS: Record<
  NotificationContentType,
  { title: string; message: string; pathPrefix: string }
> = {
  song: {
    title: "New Song Added",
    message: "A new worship song has been added.",
    pathPrefix: "/songs",
  },
  article: {
    title: "New Article Published",
    message: "A new article is available to read.",
    pathPrefix: "/articles",
  },
  sermon: {
    title: "New Sermon Added",
    message: "A new sermon has been published.",
    pathPrefix: "/sermons",
  },
};

function toMillis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { toMillis(): number }).toMillis === "function"
  ) {
    return (value as { toMillis(): number }).toMillis();
  }
  if (typeof value === "number") return value;
  return Date.now();
}

function normalizeNotification(
  id: string,
  data: Record<string, unknown>
): FirebaseNotification {
  const type = (data.type as NotificationContentType) ?? "song";
  const preset = NOTIFICATION_PRESETS[type] ?? NOTIFICATION_PRESETS.song;

  return {
    id,
    type,
    title: String(data.title ?? preset.title),
    message: String(data.message ?? preset.message),
    // Fall back to legacy `title` field for notifications created before
    // `contentTitle` existed.
    contentTitle: String(data.contentTitle ?? data.title ?? ""),
    image: String(data.image ?? "") || undefined,
    contentId: String(data.contentId ?? ""),
    createdAt: toMillis(data.createdAt),
  };
}

export function getNotificationContentPath(
  notification: Pick<FirebaseNotification, "type" | "contentId">
): string {
  const preset = NOTIFICATION_PRESETS[notification.type] ?? NOTIFICATION_PRESETS.song;
  return `${preset.pathPrefix}/${encodeURIComponent(notification.contentId)}`;
}

export function getNotificationTypeLabel(type: NotificationContentType): string {
  return (NOTIFICATION_PRESETS[type] ?? NOTIFICATION_PRESETS.song).title;
}

/**
 * Creates a single in-app notification document for newly published content.
 * Throws on failure so callers can log/handle; use a wrapper if the failure
 * must not block the surrounding operation.
 */
export async function createPublishNotification(input: {
  type: NotificationContentType;
  contentId: string;
  contentTitle: string;
  image?: string;
}): Promise<string | null> {
  if (!input.contentId.trim() || !input.contentTitle.trim()) {
    console.warn("[notifications] skipped — missing contentId or contentTitle", input);
    return null;
  }

  const preset = NOTIFICATION_PRESETS[input.type] ?? NOTIFICATION_PRESETS.song;

  const payload = {
    type: input.type,
    title: preset.title,
    message: preset.message,
    contentTitle: input.contentTitle.trim(),
    image: input.image?.trim() || "",
    contentId: input.contentId,
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), payload);
    console.info(
      `[notifications] created ${ref.id} (${payload.type}: ${payload.contentTitle})`
    );
    return ref.id;
  } catch (error) {
    console.error("[notifications] failed to create notification", error, payload);
    throw error;
  }
}

export function subscribeToNotifications(
  onChange: (notifications: FirebaseNotification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const notificationsQuery = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(30)
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((docSnap) =>
          normalizeNotification(docSnap.id, docSnap.data() as Record<string, unknown>)
        )
      );
    },
    (error) => {
      console.error("[subscribeToNotifications]", error);
      onError?.(error);
    }
  );
}

export function subscribeToReadNotificationIds(
  userId: string,
  onChange: (readIds: Set<string>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const readsQuery = query(
    collection(db, "users", userId, "notificationReads")
  );

  return onSnapshot(
    readsQuery,
    (snapshot) => {
      onChange(new Set(snapshot.docs.map((docSnap) => docSnap.id)));
    },
    (error) => {
      console.error("[subscribeToReadNotificationIds]", error);
      onError?.(error);
    }
  );
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    await setDoc(
      doc(db, "users", userId, "notificationReads", notificationId),
      { readAt: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error("[notifications] failed to mark read", error);
  }
}

export async function markAllNotificationsRead(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  await Promise.all(
    notificationIds.map((notificationId) =>
      markNotificationRead(userId, notificationId)
    )
  );
}
