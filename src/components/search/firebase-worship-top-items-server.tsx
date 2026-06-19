import { getPublishedArticles } from "@/lib/firebase-article-queries";
import { getPublishedSermons } from "@/lib/firebase-sermon-queries";
import { getAllSongs } from "@/lib/firebase-queries";

import { WorshipTopItemsClient } from "./firebase-worship-top-items";

export async function FirebaseWorshipTopItems() {
  const [songs, sermons, articles] = await Promise.all([
    getAllSongs(),
    getPublishedSermons(),
    getPublishedArticles(),
  ]);

  return (
    <WorshipTopItemsClient
      songs={songs.slice(0, 12)}
      sermons={sermons.slice(0, 12)}
      articles={articles.slice(0, 12)}
    />
  );
}
