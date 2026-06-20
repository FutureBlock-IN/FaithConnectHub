"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import type { FirebaseEvent } from "@/types/firebase-event";

import { EventCard } from "@/components/events/event-card";
import { usePublishedEvents } from "@/hooks/use-published-events";

type EventsListClientProps = {
  initialUpcoming: FirebaseEvent[];
  initialPast: FirebaseEvent[];
};

export function EventsListClient({
  initialUpcoming,
  initialPast,
}: EventsListClientProps) {
  const initialCombined = useMemo(
    () => [...initialUpcoming, ...initialPast],
    [initialUpcoming, initialPast]
  );
  const { grouped, loading } = usePublishedEvents(initialCombined);
  const { upcoming, past } = grouped;

  if (loading && upcoming.length === 0 && past.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/50 py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <EventsSection title="Upcoming Events" events={upcoming} emptyMessage="No upcoming events scheduled right now." />
      <EventsSection title="Past Events" events={past} emptyMessage="No past events to show yet." />
    </div>
  );
}

function EventsSection({
  title,
  events,
  emptyMessage,
}: {
  title: string;
  events: FirebaseEvent[];
  emptyMessage: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-bold sm:text-xl">{title}</h2>
      {events.length === 0 ?
        <div className="rounded-2xl border border-dashed border-border/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      }
    </section>
  );
}
