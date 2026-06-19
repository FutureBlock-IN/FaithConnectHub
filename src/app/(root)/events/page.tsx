import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Events",
  description: "Upcoming worship events",
};

export default function EventsPage() {
  return (
    <RequireAuth>
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and manage worship events.
        </p>
      </div>
    </RequireAuth>
  );
}
