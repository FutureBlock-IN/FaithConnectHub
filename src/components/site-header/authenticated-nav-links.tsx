"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake } from "lucide-react";

import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { cn } from "@/lib/utils";

type AuthenticatedNavLinksProps = {
  className?: string;
};

export function AuthenticatedNavLinks({ className }: AuthenticatedNavLinksProps) {
  const pathname = usePathname();
  const { authUser, loading } = useFirebaseAuth();

  if (loading || !authUser) {
    return null;
  }

  const isActive = pathname === "/prayer-requests" || pathname.startsWith("/prayer-requests/");

  return (
    <Link
      href="/prayer-requests"
      aria-label="Prayer Requests"
      title="Prayer Requests"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground",
        isActive ? "bg-accent text-foreground" : "text-muted-foreground",
        className
      )}
    >
      <HeartHandshake className="size-4" aria-hidden />
    </Link>
  );
}
