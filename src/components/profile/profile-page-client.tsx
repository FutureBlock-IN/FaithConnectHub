"use client";

import Link from "next/link";
import { Clock, Heart, LayoutDashboard, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { useFavorites } from "@/context/favorites-context";

export function ProfilePageClient() {
  const { authUser, profile } = useFirebaseAuth();
  const { favorites, loading } = useFavorites();

  const displayName =
    profile?.firstName || profile?.lastName ?
      `${profile.firstName} ${profile.lastName}`.trim()
    : authUser?.displayName ?? "User";

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account.
        </p>
      </div>

      <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{authUser?.email}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Activity
        </h2>
        <Link
          href="/profile/dashboard"
          className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-4 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </div>
            <div>
              <p className="font-medium">My Dashboard</p>
              <p className="text-sm text-muted-foreground">
                Stats, recent activity, events, and more
              </p>
            </div>
          </div>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Library
        </h2>
        <Link
          href="/favorites"
          className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-4 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Heart className="size-5 fill-current" />
            </div>
            <div>
              <p className="font-medium">My Favorites</p>
              <p className="text-sm text-muted-foreground">
                Saved songs, sermons, and articles
              </p>
            </div>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            {loading ? "…" : favorites.length}
          </div>
        </Link>
      </section>

      <Button asChild variant="outline">
        <Link href="/settings">
          <Settings className="mr-2 size-4" />
          Settings
        </Link>
      </Button>
    </div>
  );
}
