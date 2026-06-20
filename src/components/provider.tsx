"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

import { FirebaseAuthProvider } from "@/context/firebase-auth-context";
import { ContentAuthDialogProvider } from "@/context/content-auth-dialog-context";
import { GlobalAudioPlayerShell } from "./global-audio-player-shell";
import { Toaster } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";

type Props = {
  theme?: ThemeProviderProps;
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

export default function Providers({ children, theme }: Props) {
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
      <FirebaseAuthProvider>
        <ContentAuthDialogProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <GlobalAudioPlayerShell>{children}</GlobalAudioPlayerShell>
            </TooltipProvider>
          </QueryClientProvider>
        </ContentAuthDialogProvider>
      </FirebaseAuthProvider>

      <Toaster />
    </ThemeProvider>
  );
}
