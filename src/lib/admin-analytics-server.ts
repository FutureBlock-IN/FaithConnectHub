import type { Firestore } from "firebase-admin/firestore";

import {
  buildCountsFromRecords,
  normalizeUserCreatedAt,
  rankContentByCounts,
  type AnalyticsContentItem,
  type RankedContentInsight,
  type RecentUserRow,
} from "@/lib/admin-analytics-utils";
import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";
import { FAVORITES_COLLECTION } from "@/lib/favorite-firestore";
import { RECENTLY_VIEWED_COLLECTION } from "@/lib/recently-viewed-firestore";

type AdminInsightsPayload = {
  topFavoritedSong: RankedContentInsight | null;
  topViewedSermon: RankedContentInsight | null;
  topReadArticle: RankedContentInsight | null;
  recentUsers: RecentUserRow[];
  userCount: number;
};

function mapSongTitle(data: Record<string, unknown>): string {
  return String(data.songTitle ?? data.title ?? "Untitled song").trim();
}

function mapSermonTitle(data: Record<string, unknown>): string {
  return String(data.title ?? "Untitled sermon").trim();
}

function mapArticleTitle(data: Record<string, unknown>): string {
  return String(data.title ?? "Untitled article").trim();
}

async function loadChurchContentItems(
  adminDb: Firestore,
  churchScope: string | null
): Promise<{
  songs: AnalyticsContentItem[];
  sermons: AnalyticsContentItem[];
  articles: AnalyticsContentItem[];
}> {
  const scopedChurchId =
    MULTI_CHURCH_ENABLED ? churchScope?.trim() || null : null;
  const songs: AnalyticsContentItem[] = [];
  const sermons: AnalyticsContentItem[] = [];
  const articles: AnalyticsContentItem[] = [];

  const songsQuery = scopedChurchId
    ? adminDb.collection("songs").where("churchId", "==", scopedChurchId)
    : adminDb.collection("songs");

  const songsSnap = await songsQuery.get();
  for (const docSnap of songsSnap.docs) {
    const data = docSnap.data();
    songs.push({
      id: docSnap.id,
      title: mapSongTitle(data),
      churchId: String(data.churchId ?? ""),
    });
  }

  for (const collectionName of ["sermons", "ceremonies"] as const) {
    const sermonsQuery = scopedChurchId
      ? adminDb.collection(collectionName).where("churchId", "==", scopedChurchId)
      : adminDb.collection(collectionName);

    const sermonsSnap = await sermonsQuery.get();
    for (const docSnap of sermonsSnap.docs) {
      const data = docSnap.data();
      sermons.push({
        id: docSnap.id,
        title: mapSermonTitle(data),
        churchId: String(data.churchId ?? ""),
      });
    }
  }

  const articlesQuery = scopedChurchId
    ? adminDb.collection("articles").where("churchId", "==", scopedChurchId)
    : adminDb.collection("articles");

  const articlesSnap = await articlesQuery.get();
  for (const docSnap of articlesSnap.docs) {
    const data = docSnap.data();
    articles.push({
      id: docSnap.id,
      title: mapArticleTitle(data),
      churchId: String(data.churchId ?? ""),
    });
  }

  return { songs, sermons, articles };
}

async function loadScopedUsers(
  adminDb: Firestore,
  churchScope: string | null
): Promise<{ recentUsers: RecentUserRow[]; userCount: number }> {
  const scopedChurchId =
    MULTI_CHURCH_ENABLED ? churchScope?.trim() || null : null;

  const usersQuery = scopedChurchId
    ? adminDb
        .collection("users")
        .where("churchId", "==", scopedChurchId)
        .orderBy("createdAt", "desc")
        .limit(8)
    : adminDb.collection("users").orderBy("createdAt", "desc").limit(8);

  const usersSnap = await usersQuery.get();
  const recentUsers = usersSnap.docs.map((docSnap) => {
    const data = docSnap.data();
    const firstName = String(data.firstName ?? "").trim();
    const lastName = String(data.lastName ?? "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Member";

    return {
      id: docSnap.id,
      name,
      email: String(data.email ?? "").trim(),
      createdAt: normalizeUserCreatedAt(data.createdAt),
    };
  });

  const countQuery = scopedChurchId
    ? adminDb.collection("users").where("churchId", "==", scopedChurchId)
    : adminDb.collection("users");

  const countSnap = await countQuery.count().get();

  return {
    recentUsers,
    userCount: countSnap.data().count,
  };
}

export async function loadAdminAnalyticsInsights(
  adminDb: Firestore,
  churchScope: string | null
): Promise<AdminInsightsPayload> {
  const [{ songs, sermons, articles }, favoritesSnap, recentlyViewedSnap, users] =
    await Promise.all([
      loadChurchContentItems(adminDb, churchScope),
      adminDb.collection(FAVORITES_COLLECTION).get(),
      adminDb.collection(RECENTLY_VIEWED_COLLECTION).get(),
      loadScopedUsers(adminDb, churchScope),
    ]);

  const allowedSongIds = new Set(songs.map((item) => item.id));
  const allowedSermonIds = new Set(sermons.map((item) => item.id));
  const allowedArticleIds = new Set(articles.map((item) => item.id));

  const favoriteRecords = favoritesSnap.docs
    .map((docSnap) => docSnap.data())
    .filter((record) => {
      const itemType = String(record.itemType ?? "");
      const itemId = String(record.itemId ?? "");
      if (itemType === "song") return allowedSongIds.has(itemId);
      if (itemType === "sermon") return allowedSermonIds.has(itemId);
      if (itemType === "article") return allowedArticleIds.has(itemId);
      return false;
    })
    .map((record) => ({
      itemId: String(record.itemId ?? ""),
      itemType: String(record.itemType ?? ""),
    }));

  const viewedRecords = recentlyViewedSnap.docs
    .map((docSnap) => docSnap.data())
    .filter((record) => {
      const itemType = String(record.itemType ?? "");
      const itemId = String(record.itemId ?? "");
      if (itemType === "sermon") return allowedSermonIds.has(itemId);
      if (itemType === "article") return allowedArticleIds.has(itemId);
      return false;
    })
    .map((record) => ({
      itemId: String(record.itemId ?? ""),
      itemType: String(record.itemType ?? ""),
    }));

  const songFavoriteCounts = buildCountsFromRecords(favoriteRecords, "song");
  const sermonViewCounts = buildCountsFromRecords(viewedRecords, "sermon");
  const sermonFavoriteCounts = buildCountsFromRecords(favoriteRecords, "sermon");
  const articleViewCounts = buildCountsFromRecords(viewedRecords, "article");
  const articleFavoriteCounts = buildCountsFromRecords(
    favoriteRecords,
    "article"
  );

  const topViewedSermon =
    rankContentByCounts(sermonViewCounts, sermons) ??
    rankContentByCounts(sermonFavoriteCounts, sermons);

  const topReadArticle =
    rankContentByCounts(articleViewCounts, articles) ??
    rankContentByCounts(articleFavoriteCounts, articles);

  return {
    topFavoritedSong: rankContentByCounts(songFavoriteCounts, songs),
    topViewedSermon,
    topReadArticle,
    recentUsers: users.recentUsers,
    userCount: users.userCount,
  };
}
