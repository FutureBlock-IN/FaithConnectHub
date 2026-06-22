"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Loader2 } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { usePublishedEvents } from "@/hooks/use-published-events";

export function DashboardUpcomingEventsSection() {
  const { events, loading } = usePublishedEvents([], {
    maxItems: 3,
    upcomingOnly: true,
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
            Ministry
          </p>
          <h2 className="font-heading text-xl font-bold">Upcoming Events</h2>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
        >
          <Link href="/events">
            View All Events
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>

      {loading ?
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/50 py-14">
          <Loader2 className="size-5 animate-spin text-primary/60" />
        </div>
      : events.length === 0 ?
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
          <CalendarDays className="mx-auto size-7 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No upcoming events</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for worship and community gatherings.
          </p>
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
