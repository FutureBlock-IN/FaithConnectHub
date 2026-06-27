"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/context/firebase-auth-context";

type RegisterForEventButtonProps = {
  eventId: string;
  eventTitle: string;
};

export function RegisterForEventButton({
  eventId,
  eventTitle,
}: RegisterForEventButtonProps) {
  const { authUser, profile, loading, user } = useFirebaseAuth();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleRegister() {
    if (!user) return;

    setRegistering(true);
    try {
      const token = await user.getIdToken();
      const userName =
        profile ?
          `${profile.firstName} ${profile.lastName}`.trim()
        : authUser?.displayName?.trim();

      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, userName }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        alreadyRegistered?: boolean;
      };

      if (!response.ok) {
        toast.error(data.error ?? "Unable to register. Please try again.");
        return;
      }

      setRegistered(true);
      toast.success(
        data.message ??
          `You're registered for ${eventTitle}. Check your email for details.`
      );
    } catch {
      toast.error("Unable to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" className="rounded-full" disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!authUser) {
    return (
      <Button asChild variant="default" size="sm" className="rounded-full">
        <Link href={`/signin?callbackUrl=/events/${eventId}`}>
          <Ticket className="mr-2 size-4" />
          Sign in to Register
        </Link>
      </Button>
    );
  }

  if (registered) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
        disabled
      >
        <CheckCircle2 className="mr-2 size-4" />
        Registered
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="rounded-full"
      disabled={registering}
      onClick={handleRegister}
    >
      {registering ?
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Registering...
        </>
      : <>
          <Ticket className="mr-2 size-4" />
          Register for Event
        </>
      }
    </Button>
  );
}
