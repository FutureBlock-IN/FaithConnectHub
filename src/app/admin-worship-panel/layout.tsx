import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RequireAdmin } from "@/components/auth/require-admin";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Admin Panel",
  description: `Manage content for ${siteConfig.name}.`,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        <header
          className="sticky top-0 z-50 w-full border-b bg-background"
          suppressHydrationWarning
        >
          <div className="container flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt={siteConfig.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div className="hidden xl:flex xl:flex-col">
                <span className="font-heading text-base font-semibold">
                  {siteConfig.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Admin Panel
                </span>
              </div>
            </div>
            <div className="w-12" />
          </div>
        </header>
        {children}
      </div>
    </RequireAdmin>
  );
}
