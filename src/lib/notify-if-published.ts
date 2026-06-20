import type { NotificationContentType } from "@/types/firebase-notification";
import type { EventStatus } from "@/types/firebase-event";
import type { PrayerRequestStatus } from "@/types/firebase-prayer-request";

import { createPublishNotification } from "@/lib/firebase-notification-queries";

/**
 * Safe wrapper used by admin publish flows.
 *
 * - Only fires when content transitions into a published state.
 * - Never throws: a notification failure must not break content creation.
 *   Failures are logged for debugging instead.
 *
 * Future channels (e.g. email) can be dispatched from here so publish flows
 * don't need to change.
 */
export async function notifyIfNewlyPublished(input: {
  type: Extract<NotificationContentType, "song" | "article" | "sermon">;
  contentId: string;
  contentTitle: string;
  image?: string;
  isPublished: boolean;
  wasPublished?: boolean;
}): Promise<void> {
  const isNewPublish = input.isPublished && !input.wasPublished;
  if (!isNewPublish) return;

  try {
    await createPublishNotification({
      type: input.type,
      contentId: input.contentId,
      contentTitle: input.contentTitle,
      image: input.image,
    });
  } catch (error) {
    console.error("[notifyIfNewlyPublished] notification dispatch failed:", error);
  }
}

export async function notifyIfEventPublished(input: {
  contentId: string;
  contentTitle: string;
  image?: string;
  status: EventStatus;
  wasStatus?: EventStatus;
}): Promise<void> {
  const isNewPublish =
    input.status === "published" && input.wasStatus !== "published";
  if (!isNewPublish) return;

  try {
    await createPublishNotification({
      type: "event",
      contentId: input.contentId,
      contentTitle: input.contentTitle,
      image: input.image,
    });
  } catch (error) {
    console.error("[notifyIfEventPublished] notification dispatch failed:", error);
  }
}

export async function notifyIfPrayerApproved(input: {
  contentId: string;
  contentTitle: string;
  previousStatus: PrayerRequestStatus;
  newStatus: PrayerRequestStatus;
}): Promise<void> {
  if (input.newStatus !== "approved" || input.previousStatus === "approved") {
    return;
  }

  try {
    await createPublishNotification({
      type: "prayer",
      contentId: input.contentId,
      contentTitle: input.contentTitle,
    });
  } catch (error) {
    console.error("[notifyIfPrayerApproved] notification dispatch failed:", error);
  }
}
