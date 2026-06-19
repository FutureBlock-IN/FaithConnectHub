import type { NotificationContentType } from "@/types/firebase-notification";

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
  type: NotificationContentType;
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
