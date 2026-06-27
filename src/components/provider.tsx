"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

import type { FirebaseChurch } from "@/types/firebase-church";

import { ActiveChurchProvider } from "@/context/active-church-context";
import { FirebaseAuthProvider } from "@/context/firebase-auth-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { RecentlyViewedProvider } from "@/context/recently-viewed-context";
import { ContentAuthDialogProvider } from "@/context/content-auth-dialog-context";
import { SubscriptionShell } from "@/components/subscription/subscription-shell";
import { GlobalAudioPlayerShell } from "./global-audio-player-shell";
import { Toaster } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";

type Props = {
  theme?: ThemeProviderProps;
  initialChurches?: FirebaseChurch[];
  initialActiveChurchId?: string | null;
  children: React.ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({
  children,
  theme,
  initialChurches = [],
  initialActiveChurchId = null,
}: Props) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      defaultTheme="system"
      storageKey="cfp-theme"
      disableTransitionOnChange
      themes={["light", "dark", "system"]}
      {...theme}
    >
      <ActiveChurchProvider
        initialChurches={initialChurches}
        initialActiveChurchId={initialActiveChurchId}
      >
        <FirebaseAuthProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <ContentAuthDialogProvider>
                <QueryClientProvider client={queryClient}>
                  <SubscriptionShell>
                    <TooltipProvider>
                      <GlobalAudioPlayerShell>{children}</GlobalAudioPlayerShell>
                    </TooltipProvider>
                  </SubscriptionShell>
                </QueryClientProvider>
              </ContentAuthDialogProvider>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </FirebaseAuthProvider>
      </ActiveChurchProvider>

      <Toaster />
    </ThemeProvider>
  );
}
