"use client";

import React from "react";

import { useCurrentSongIndex, useIsPlayerInit, useQueue } from "@/hooks/use-store";
import { cn, hasPlayableAudio } from "@/lib/utils";

type RootShellProps = {
  children: React.ReactNode;
  player: React.ReactNode;
};

export function RootShell({ children, player }: RootShellProps) {
  const [queue, setQueue] = useQueue();
  const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
  const [, setIsPlayerInit] = useIsPlayerInit();

  const currentSong = queue[currentIndex];
  const showPlayer =
    queue.length > 0 && hasPlayableAudio(currentSong?.download_url);

  React.useLayoutEffect(() => {
    if (!queue.length) {
      setIsPlayerInit(false);
      return;
    }

    if (!hasPlayableAudio(currentSong?.download_url)) {
      setQueue([]);
      setCurrentIndex(0);
      setIsPlayerInit(false);
    }
  }, [
    queue.length,
    currentIndex,
    currentSong?.download_url,
    setQueue,
    setCurrentIndex,
    setIsPlayerInit,
  ]);

  return (
    <>
      <main
        className={cn(
          "mx-auto w-full max-w-7xl overflow-x-hidden p-3 sm:p-4 md:p-6",
          showPlayer ? "pb-24" : "pb-6"
        )}
      >
        {children}
      </main>
      {showPlayer ? player : null}
    </>
  );
}
