"use server";

import { searchArticles } from "./firebase-article-queries";
import { searchEvents } from "./firebase-event-queries";
import { searchSermons } from "./firebase-sermon-queries";
import { searchSongs } from "./firebase-queries";
import {
  buildGlobalSearchResults,
  type GlobalSearchGroupedResults,
} from "./global-search";

export async function searchGlobal(
  churchId: string,
  searchQuery: string
): Promise<GlobalSearchGroupedResults> {
  const normalized = searchQuery.trim();
  if (!normalized) {
    return { songs: [], sermons: [], articles: [], events: [] };
  }

  const [songs, sermons, articles, events] = await Promise.all([
    searchSongs(churchId, normalized),
    searchSermons(churchId, normalized),
    searchArticles(churchId, normalized),
    searchEvents(churchId, normalized),
  ]);

  return buildGlobalSearchResults({ songs, sermons, articles, events });
}
