"use client";

import { useCurrentSongIndex, useQueue } from "@/hooks/use-store";
import { hasPlayableAudio } from "@/lib/utils";

export function usePlayerVisible() {
  const [queue] = useQueue();
  const [currentIndex] = useCurrentSongIndex();
  const currentSong = queue[currentIndex];

  return queue.length > 0 && hasPlayableAudio(currentSong?.download_url);
}
