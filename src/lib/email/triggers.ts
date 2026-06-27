import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeArticleFromFirestore, ARTICLES_COLLECTION } from "@/lib/article-firestore";
import {
  DONATION_CAMPAIGNS_COLLECTION,
  DONATIONS_COLLECTION,
  normalizeDonationCampaignFromFirestore,
  normalizeDonationFromFirestore,
} from "@/lib/donation-firestore";
import {
  EVENTS_COLLECTION,
  formatEventDate,
  normalizeEventFromFirestore,
} from "@/lib/event-firestore";
import {
  PRAYER_REQUESTS_COLLECTION,
  normalizePrayerRequestFromFirestore,
} from "@/lib/prayer-request-firestore";
import { normalizeSermonFromFirestore, SERMONS_COLLECTION } from "@/lib/sermon-firestore";
import {
  getSongArtistLine,
  normalizeSongFromFirestore,
  SONGS_COLLECTION,
} from "@/lib/song-firestore";

import { dispatchEmail, EmailService } from "./index";
import {
  canSendPreferenceEmail,
  normalizeEmailPreferences,
} from "./preferences";
import type { EmailPreferenceKey } from "./types";

export type ContentPublishEmailType =
  | "song"
  | "sermon"
  | "article"
  | "donation_campaign";

async function forEachEligibleUser(
  preferenceKey: EmailPreferenceKey,
  onUser: (user: { id: string; email: string; userName: string }) => void
): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 0;

  const usersSnap = await adminDb.collection("users").get();
  let queued = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data() as Record<string, unknown>;
    const email = String(data.email ?? "").trim();
    if (!email) continue;

    const preferences = normalizeEmailPreferences(data.emailPreferences);
    if (!canSendPreferenceEmail(preferences, preferenceKey)) continue;

    const userName =
      `${String(data.firstName ?? "")} ${String(data.lastName ?? "")}`.trim() ||
      "Friend";

    onUser({ id: userDoc.id, email, userName });
    queued += 1;
  }

  return queued;
}

export function triggerWelcomeEmails(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
}): void {
  dispatchEmail("welcome", () =>
    EmailService.sendWelcomeEmail({
      to: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      userId: input.userId,
    })
  );

  dispatchEmail("admin-new-user", () =>
    EmailService.notifyAdmin({
      type: "new_user",
      title: "New user registered",
      summary: "A new user has joined FaithConnectHub.",
      details: {
        Name: `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim() || "—",
        Email: input.email,
      },
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://faithconnecthub.com"}/admin-worship-panel/users`,
    })
  );
}

export function triggerPrayerSubmittedEmails(input: {
  prayerId: string;
  prayerTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
}): void {
  dispatchEmail("prayer-confirmation", () =>
    EmailService.sendPrayerConfirmation({
      to: input.userEmail,
      userName: input.userName,
      prayerTitle: input.prayerTitle,
      prayerId: input.prayerId,
      userId: input.userId,
    })
  );

  dispatchEmail("admin-prayer-submitted", () =>
    EmailService.notifyAdmin({
      type: "prayer_submitted",
      title: "New prayer request submitted",
      summary: "A prayer request is awaiting moderation.",
      details: {
        Title: input.prayerTitle,
        Submitter: input.userName,
        Email: input.userEmail,
      },
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://faithconnecthub.com"}/admin-worship-panel/content?tab=prayers`,
    })
  );
}

export async function triggerPrayerApprovedEmail(prayerId: string): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) return;

  try {
    const snap = await adminDb
      .collection(PRAYER_REQUESTS_COLLECTION)
      .doc(prayerId)
      .get();

    if (!snap.exists) return;

    const prayer = normalizePrayerRequestFromFirestore(
      snap.id,
      snap.data() as Record<string, unknown>
    );

    const email = prayer.email?.trim();
    if (!email) return;

    await EmailService.sendPrayerApproved({
      to: email,
      userName: prayer.isAnonymous ? "Friend" : prayer.name || "Friend",
      prayerTitle: prayer.title,
      prayerId: prayer.id,
      userId: prayer.userId,
    });
  } catch (error) {
    console.error("[email] prayer approved trigger failed:", error);
  }
}

export function triggerPrayerApprovedEmailDispatch(prayerId: string): void {
  dispatchEmail("prayer-approved", () => triggerPrayerApprovedEmail(prayerId));
}

export async function triggerDonationCompletedEmails(
  donationId: string
): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) return;

  try {
    const donationSnap = await adminDb
      .collection(DONATIONS_COLLECTION)
      .doc(donationId)
      .get();

    if (!donationSnap.exists) return;

    const donation = normalizeDonationFromFirestore(
      donationSnap.id,
      donationSnap.data() as Record<string, unknown>
    );

    if (!donation.donorEmail?.trim()) return;

    const campaignSnap = await adminDb
      .collection(DONATION_CAMPAIGNS_COLLECTION)
      .doc(donation.campaignId)
      .get();

    const campaignTitle =
      campaignSnap.exists ?
        normalizeDonationCampaignFromFirestore(
          campaignSnap.id,
          campaignSnap.data() as Record<string, unknown>
        ).title
      : "Ministry Campaign";

    const amountLabel = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: donation.currency,
    }).format(donation.amount);

    const dateLabel = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await EmailService.sendDonationReceipt({
      to: donation.donorEmail,
      donorName: donation.donorName,
      amount: amountLabel,
      donationId: donation.id,
      date: dateLabel,
      campaignTitle,
    });

    await EmailService.notifyAdmin({
      type: "donation_received",
      title: "New donation received",
      summary: "A donation has been completed successfully.",
      details: {
        Donor: donation.donorName,
        Amount: amountLabel,
        Campaign: campaignTitle,
        "Donation ID": donation.id,
      },
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://faithconnecthub.com"}/admin-worship-panel/content?tab=donations`,
    });
  } catch (error) {
    console.error("[email] donation trigger failed:", error);
  }
}

export async function triggerEventRegistrationEmails(input: {
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
}): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) return;

  try {
    const eventSnap = await adminDb
      .collection(EVENTS_COLLECTION)
      .doc(input.eventId)
      .get();

    if (!eventSnap.exists) return;

    const event = normalizeEventFromFirestore(
      eventSnap.id,
      eventSnap.data() as Record<string, unknown>
    );

    await EmailService.sendEventRegistration({
      to: input.userEmail,
      userName: input.userName,
      eventTitle: event.title,
      eventDate: formatEventDate(event.eventDate),
      eventTime: event.eventTime,
      location: event.location,
      eventId: event.id,
      userId: input.userId,
    });

    await EmailService.notifyAdmin({
      type: "event_registration",
      title: "New event registration",
      summary: "Someone registered for an upcoming event.",
      details: {
        Event: event.title,
        Registrant: input.userName,
        Email: input.userEmail,
        Date: formatEventDate(event.eventDate),
      },
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://faithconnecthub.com"}/events/${event.id}`,
    });
  } catch (error) {
    console.error("[email] event registration trigger failed:", error);
  }
}

/**
 * Notify all users with event email notifications enabled about a published event.
 * Sends asynchronously — individual failures are logged and do not block others.
 */
export async function triggerEventAnnouncementEmails(
  eventId: string
): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.warn("[email] event announcement skipped: admin not configured");
    return;
  }

  try {
    const eventSnap = await adminDb
      .collection(EVENTS_COLLECTION)
      .doc(eventId)
      .get();

    if (!eventSnap.exists) {
      console.warn("[email] event announcement skipped: event not found", eventId);
      return;
    }

    const event = normalizeEventFromFirestore(
      eventSnap.id,
      eventSnap.data() as Record<string, unknown>
    );

    if (event.status !== "published") {
      return;
    }

    const usersSnap = await adminDb.collection("users").get();
    let queued = 0;

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data() as Record<string, unknown>;
      const email = String(data.email ?? "").trim();
      if (!email) continue;

      const preferences = normalizeEmailPreferences(data.emailPreferences);
      if (!canSendPreferenceEmail(preferences, "event")) continue;

      const userName =
        `${String(data.firstName ?? "")} ${String(data.lastName ?? "")}`.trim() ||
        "Friend";

      queued += 1;
      dispatchEmail(`event-announcement:${userDoc.id}`, () =>
        EmailService.sendEventAnnouncement({
          to: email,
          userName,
          eventTitle: event.title,
          eventDate: formatEventDate(event.eventDate),
          eventTime: event.eventTime,
          location: event.location,
          description: event.description,
          eventId: event.id,
          userId: userDoc.id,
        })
      );
    }

    console.log(
      `[email] event announcement queued for ${queued} user(s):`,
      event.title
    );
  } catch (error) {
    console.error("[email] event announcement trigger failed:", error);
  }
}

/**
 * Broadcast content publish emails to users who opted in.
 */
export async function triggerContentAnnouncementEmails(
  type: ContentPublishEmailType,
  contentId: string
): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.warn("[email] content announcement skipped: admin not configured");
    return;
  }

  try {
    switch (type) {
      case "song": {
        const snap = await adminDb.collection(SONGS_COLLECTION).doc(contentId).get();
        if (!snap.exists) return;
        const song = normalizeSongFromFirestore(
          snap.id,
          snap.data() as Record<string, unknown>
        );
        if (!song.published) return;

        const artist = getSongArtistLine(song);
        const description = [artist, song.scriptureReference, song.category]
          .filter(Boolean)
          .join(" · ");

        const queued = await forEachEligibleUser("song", (user) => {
          dispatchEmail(`song-published:${user.id}`, () =>
            EmailService.sendSongPublished({
              to: user.email,
              userName: user.userName,
              songTitle: song.songTitle,
              description,
              songId: song.id,
              userId: user.id,
            })
          );
        });

        console.log(
          `[email] song announcement queued for ${queued} user(s):`,
          song.songTitle
        );
        return;
      }

      case "sermon": {
        const snap = await adminDb.collection(SERMONS_COLLECTION).doc(contentId).get();
        if (!snap.exists) return;
        const sermon = normalizeSermonFromFirestore(
          snap.id,
          snap.data() as Record<string, unknown>
        );
        if (!sermon.isPublished) return;

        const queued = await forEachEligibleUser("sermon", (user) => {
          dispatchEmail(`sermon-published:${user.id}`, () =>
            EmailService.sendSermonPublished({
              to: user.email,
              userName: user.userName,
              sermonTitle: sermon.title,
              speaker: sermon.speaker,
              scriptureReference: sermon.scriptureReference,
              sermonId: sermon.id,
              userId: user.id,
            })
          );
        });

        console.log(
          `[email] sermon announcement queued for ${queued} user(s):`,
          sermon.title
        );
        return;
      }

      case "article": {
        const snap = await adminDb
          .collection(ARTICLES_COLLECTION)
          .doc(contentId)
          .get();
        if (!snap.exists) return;
        const article = normalizeArticleFromFirestore(
          snap.id,
          snap.data() as Record<string, unknown>
        );
        if (!article.isPublished) return;

        const queued = await forEachEligibleUser("article", (user) => {
          dispatchEmail(`article-published:${user.id}`, () =>
            EmailService.sendArticlePublished({
              to: user.email,
              userName: user.userName,
              articleTitle: article.title,
              summary: article.shortDescription,
              articleId: article.id,
              userId: user.id,
            })
          );
        });

        console.log(
          `[email] article announcement queued for ${queued} user(s):`,
          article.title
        );
        return;
      }

      case "donation_campaign": {
        const snap = await adminDb
          .collection(DONATION_CAMPAIGNS_COLLECTION)
          .doc(contentId)
          .get();
        if (!snap.exists) return;
        const campaign = normalizeDonationCampaignFromFirestore(
          snap.id,
          snap.data() as Record<string, unknown>
        );
        if (campaign.status !== "active") return;

        const goalAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: campaign.currency,
        }).format(campaign.targetAmount);

        const queued = await forEachEligibleUser("donation", (user) => {
          dispatchEmail(`donation-campaign:${user.id}`, () =>
            EmailService.sendDonationCampaignAnnouncement({
              to: user.email,
              userName: user.userName,
              campaignTitle: campaign.title,
              goalAmount,
              description: campaign.description,
              campaignId: campaign.id,
              userId: user.id,
            })
          );
        });

        console.log(
          `[email] donation campaign announcement queued for ${queued} user(s):`,
          campaign.title
        );
      }
    }
  } catch (error) {
    console.error(`[email] ${type} announcement trigger failed:`, error);
  }
}

export function triggerContactEmails(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): void {
  dispatchEmail("contact-confirmation", () =>
    EmailService.sendContactConfirmation({
      to: input.email,
      name: input.name,
      subject: input.subject,
    })
  );

  dispatchEmail("admin-contact", () =>
    EmailService.notifyAdmin({
      type: "contact_form",
      title: "New contact form submission",
      summary: "Someone submitted the contact form.",
      details: {
        Name: input.name,
        Email: input.email,
        Subject: input.subject,
        Message: input.message.slice(0, 500),
      },
      actionUrl: `mailto:${input.email}`,
    })
  );
}
