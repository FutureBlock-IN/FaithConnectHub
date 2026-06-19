"use client";

import Link from "next/link";
import React from "react";

import { useContentAuthDialog } from "@/context/content-auth-dialog-context";
import { useFirebaseAuth } from "@/context/firebase-auth-context";
import { cn } from "@/lib/utils";

type ProtectedContentLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Navigates to content when authenticated; opens the auth dialog when not.
 */
export function ProtectedContentLink({
  href,
  className,
  children,
}: ProtectedContentLinkProps) {
  const { user, loading } = useFirebaseAuth();
  const { openDialog } = useContentAuthDialog();

  if (!loading && user) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn("cursor-pointer text-left", className)}
      onClick={() => openDialog(href, { redirectOnClose: false })}
      disabled={loading}
    >
      {children}
    </button>
  );
}
