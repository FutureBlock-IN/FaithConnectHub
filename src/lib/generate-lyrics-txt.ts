function toTxtFilename(title: string): string {
  const slug = title
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug || "Song"}-Lyrics.txt`;
}

const DIVIDER = "====================================";

export type LyricsTxtOptions = {
  title: string;
  teluguLyrics: string;
  englishLyrics: string;
};

export function generateLyricsTxt({
  title,
  teluguLyrics,
  englishLyrics,
}: LyricsTxtOptions): Blob {
  const parts: string[] = [`Song Title: ${title}`, "", DIVIDER, ""];

  if (teluguLyrics.trim().length > 0) {
    parts.push("TELUGU LYRICS", "", teluguLyrics, "", DIVIDER, "");
  }

  if (englishLyrics.trim().length > 0) {
    parts.push("ENGLISH LYRICS", "", englishLyrics, "", DIVIDER, "");
  }

  const content = parts.join("\n");
  return new Blob([content], { type: "text/plain;charset=utf-8" });
}

export function getLyricsTxtFilename(title: string): string {
  return toTxtFilename(title);
}
