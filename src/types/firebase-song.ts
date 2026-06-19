// export type FirebaseSong = {
//   id: string;
//   title: string;
//   lyrics: string;
//   transliteratedLyrics?: string;
//   imageUrl?: string;
//   audioUrl?: string;
//   youtubeUrl?: string;
//   createdAt: number;
// };

// export type CreateSongInput = {
//   title: string;
//   lyrics: string;
//   transliteratedLyrics?: string;
//   imageUrl?: string;
//   audioUrl?: string;
//   youtubeUrl?: string;
// };

// export type UpdateSongInput = Partial<CreateSongInput>;


// Calude code -1
// /types/firebase-song.ts

export type FirebaseSong = {
  id: string;
  title: string;           // legacy fallback
  englishTitle?: string;   // new
  teluguTitle?: string;    // new
  lyrics: string;
  transliteratedLyrics?: string;
  imageUrl?: string;
  audioUrl?: string;
  youtubeUrl?: string;
  createdAt: number;
  playCount?: number;
};

export type CreateSongInput = {
  title: string;           // kept for backward compat
  englishTitle?: string;
  teluguTitle?: string;
  lyrics: string;
  transliteratedLyrics?: string;
  imageUrl?: string;
  audioUrl?: string;
  youtubeUrl?: string;
};

export type UpdateSongInput = Partial<CreateSongInput>;