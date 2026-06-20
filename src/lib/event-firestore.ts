import type {
  CreateEventInput,
  EventStatus,
  EventType,
  FirebaseEvent,
} from "@/types/firebase-event";
import { EVENT_TYPES } from "@/types/firebase-event";

import { resolveDocumentChurchId } from "./church-scope";
import { toMillis } from "./firebase-utils";

export const EVENTS_COLLECTION = "events";

const EVENT_TYPE_SET = new Set<string>(EVENT_TYPES);

export function normalizeEventType(value: unknown): EventType {
  const raw = String(value ?? "").trim();
  if (EVENT_TYPE_SET.has(raw)) {
    return raw as EventType;
  }
  return "Other";
}

export function normalizeEventStatus(value: unknown): EventStatus {
  return value === "published" ? "published" : "draft";
}

export function normalizeEventFromFirestore(
  id: string,
  data: Record<string, unknown>
): FirebaseEvent {
  return {
    id,
    churchId: resolveDocumentChurchId(data),
    title: String(data.title ?? "").trim(),
    description: String(data.description ?? "").trim(),
    bannerImage: String(data.bannerImage ?? "").trim() || undefined,
    eventType: normalizeEventType(data.eventType),
    speakerName: String(data.speakerName ?? "").trim(),
    eventDate: String(data.eventDate ?? "").trim(),
    eventTime: String(data.eventTime ?? "").trim(),
    location: String(data.location ?? "").trim(),
    status: normalizeEventStatus(data.status),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt ?? data.createdAt),
  };
}

export function buildEventCreatePayload(input: CreateEventInput) {
  return {
    churchId: input.churchId.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    bannerImage: input.bannerImage?.trim() || "",
    eventType: input.eventType,
    speakerName: input.speakerName.trim(),
    eventDate: input.eventDate.trim(),
    eventTime: input.eventTime.trim(),
    location: input.location.trim(),
    status: input.status,
  };
}

/** Parse event date + time into a timestamp for upcoming/past sorting. */
export function getEventStartTimestamp(event: FirebaseEvent): number {
  const datePart = event.eventDate.trim();
  if (!datePart) return 0;

  const timePart = event.eventTime.trim();
  const candidates = timePart
    ? [
        `${datePart}T${normalizeTimeForParse(timePart)}`,
        `${datePart} ${timePart}`,
      ]
    : [`${datePart}T00:00:00`, datePart];

  for (const candidate of candidates) {
    const parsed = Date.parse(candidate);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const dateOnly = Date.parse(`${datePart}T00:00:00`);
  return Number.isNaN(dateOnly) ? 0 : dateOnly;
}

function normalizeTimeForParse(time: string): string {
  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return trimmed;

  let hours = Number(match[1]);
  const minutes = match[2];
  const seconds = match[3] ?? "00";
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
}

export function formatEventDate(eventDate: string): string {
  const timestamp = Date.parse(`${eventDate.trim()}T00:00:00`);
  if (Number.isNaN(timestamp)) return eventDate;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function formatEventDateTime(event: FirebaseEvent): string {
  const dateLabel = formatEventDate(event.eventDate);
  return event.eventTime.trim()
    ? `${dateLabel} · ${event.eventTime.trim()}`
    : dateLabel;
}

export function splitEventsBySchedule(events: FirebaseEvent[], now = Date.now()) {
  const upcoming: FirebaseEvent[] = [];
  const past: FirebaseEvent[] = [];

  for (const event of events) {
    const start = getEventStartTimestamp(event);
    if (start >= now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  upcoming.sort(
    (a, b) => getEventStartTimestamp(a) - getEventStartTimestamp(b)
  );
  past.sort((a, b) => getEventStartTimestamp(b) - getEventStartTimestamp(a));

  return { upcoming, past };
}

export function filterPublishedEvents(events: FirebaseEvent[]): FirebaseEvent[] {
  return events.filter((event) => event.status === "published");
}
