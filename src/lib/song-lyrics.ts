import type { FirebaseSong } from "@/types/firebase-song";

export function getLyricsDisplayContent(
  lyrics: string,
  transliteratedLyrics?: string
) {
  const telugu = lyrics ?? "";
  const english = transliteratedLyrics ?? "";

  return {
    teluguDisplay: telugu.trim(),
    englishDisplay: english.trim(),
  };
}

export function getSongLyricsContent(song: FirebaseSong) {
  const telugu = song.lyrics ?? "";
  const english = song.transliteratedLyrics ?? "";
  const { teluguDisplay, englishDisplay } = getLyricsDisplayContent(
    telugu,
    english
  );

  return {
    telugu,
    english,
    teluguDisplay,
    englishDisplay,
    hasLyrics: Boolean(teluguDisplay || englishDisplay),
  };
}
