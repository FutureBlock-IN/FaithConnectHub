import type {
  CreatePrayerRequestInput,
  FirebasePrayerRequest,
  PrayerRequestStatus,
} from "@/types/firebase-prayer-request";

import { toMillis } from "./firebase-utils";

export const PRAYER_REQUESTS_COLLECTION = "prayerRequests";

const VALID_STATUSES: PrayerRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
];

function normalizeStatus(value: unknown): PrayerRequestStatus {
  const status = String(value ?? "pending").trim().toLowerCase();
  if (VALID_STATUSES.includes(status as PrayerRequestStatus)) {
    return status as PrayerRequestStatus;
  }
  return "pending";
}

export function normalizePrayerRequestFromFirestore(
  id: string,
  data: Record<string, unknown>
): FirebasePrayerRequest {
  const email = String(data.email ?? "").trim();

  return {
    id,
    name: String(data.name ?? "").trim() || "Anonymous",
    email: email || undefined,
    title: String(data.title ?? "").trim(),
    request: String(data.request ?? "").trim(),
    isAnonymous: Boolean(data.isAnonymous),
    status: normalizeStatus(data.status),
    prayerCount: Number(data.prayerCount ?? 0) || 0,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt ?? data.createdAt),
  };
}

export function getPrayerRequestDisplayName(
  request: Pick<FirebasePrayerRequest, "name" | "isAnonymous">
): string {
  if (request.isAnonymous) return "Anonymous";
  return request.name.trim() || "Anonymous";
}

export function toPrayerRequestPreview(
  request: string,
  maxLength = 120
): string {
  const normalized = request.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

/** Fixed locale so SSR and client hydration produce identical date strings. */
const PRAYER_DATE_LOCALE = "en-US";

export function formatPrayerDate(timestamp: number): string {
  return new Intl.DateTimeFormat(PRAYER_DATE_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function buildPrayerRequestCreatePayload(
  input: CreatePrayerRequestInput
): Record<string, unknown> {
  const displayName = input.isAnonymous
    ? "Anonymous"
    : getPrayerRequestDisplayName({
        name: input.name,
        isAnonymous: false,
      });

  return {
    name: displayName,
    email: input.email?.trim() || null,
    title: input.title,
    request: input.request,
    isAnonymous: input.isAnonymous,
    status: "pending",
    prayerCount: 0,
  };
}
