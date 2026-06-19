"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Music2,
  ListMusic,
  UploadCloud,
  Church,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { AddArticleModal } from "@/components/admin/add-article-modal";
import { AddSermonModal } from "@/components/admin/add-sermon-modal";
import { AddMusicModal } from "@/components/admin/add-music-modal";
import { ArticleList } from "@/components/admin/article-list";
import { SermonList } from "@/components/admin/sermon-list";
import { MusicList } from "@/components/admin/music-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeSongFromFirestore } from "@/lib/song-firestore";
import { db } from "@/lib/firebase";
import { normalizeArticleFromFirestore } from "@/lib/article-firestore";
import {
  LEGACY_SERMONS_COLLECTION,
  SERMONS_COLLECTION,
  mergeSermonsById,
  normalizeSermonFromFirestore,
} from "@/lib/sermon-firestore";

type AdminTab = "songs" | "sermons" | "articles";

function parseAdminTab(value: string | null): AdminTab {
  if (value === "sermons" || value === "articles") return value;
  return "songs";
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    parseAdminTab(searchParams.get("tab"))
  );

  useEffect(() => {
    setActiveTab(parseAdminTab(searchParams.get("tab")));
  }, [searchParams]);

  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [sermons, setSermons] = useState<FirebaseSermon[]>([]);
  const [articles, setArticles] = useState<FirebaseArticle[]>([]);

  const [songsLoading, setSongsLoading] = useState(true);
  const [sermonsLoading, setSermonsLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);

  const [songModalOpen, setSongModalOpen] = useState(false);
  const [sermonModalOpen, setSermonModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);

  const [selectedSong, setSelectedSong] = useState<FirebaseSong | null>(null);
  const [selectedSermon, setSelectedSermon] =
    useState<FirebaseSermon | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<FirebaseArticle | null>(null);

  const [loadedSongsTab, setLoadedSongsTab] = useState(
    () => parseAdminTab(searchParams.get("tab")) === "songs"
  );
  const [loadedSermonsTab, setLoadedSermonsTab] = useState(
    () => parseAdminTab(searchParams.get("tab")) === "sermons"
  );
  const [loadedArticlesTab, setLoadedArticlesTab] = useState(
    () => parseAdminTab(searchParams.get("tab")) === "articles"
  );

  useEffect(() => {
    if (activeTab === "songs") setLoadedSongsTab(true);
    if (activeTab === "sermons") setLoadedSermonsTab(true);
    if (activeTab === "articles") setLoadedArticlesTab(true);
  }, [activeTab]);

  useEffect(() => {
    if (!loadedSongsTab) return;

    const songsQuery = query(
      collection(db, "songs"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      songsQuery,
      (snapshot) => {
        setSongs(
          snapshot.docs.map((docSnap) =>
            normalizeSongFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setSongsLoading(false);
      },
      () => {
        toast.error("Unable to sync songs");
        setSongsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [loadedSongsTab]);

  const sermonSnapshotsRef = useRef<Record<string, FirebaseSermon[]>>({});

  useEffect(() => {
    if (!loadedSermonsTab) return;

    sermonSnapshotsRef.current = {};

    function publishMerged() {
      setSermons(mergeSermonsById(Object.values(sermonSnapshotsRef.current)));
      setSermonsLoading(false);
    }

    const unsubscribes = [SERMONS_COLLECTION, LEGACY_SERMONS_COLLECTION].map(
      (collectionName) => {
        const sermonsQuery = query(
          collection(db, collectionName),
          orderBy("dateCreated", "desc")
        );

        return onSnapshot(
          sermonsQuery,
          (snapshot) => {
            sermonSnapshotsRef.current[collectionName] = snapshot.docs.map(
              (docSnap) =>
                normalizeSermonFromFirestore(
                  docSnap.id,
                  docSnap.data() as Record<string, unknown>
                )
            );
            if (process.env.NODE_ENV !== "production") {
              console.info("[AdminPanel] sermons snapshot", {
                collection: collectionName,
                count: snapshot.docs.length,
              });
            }
            publishMerged();
          },
          (error) => {
            console.error("[AdminPanel] sermons snapshot failed", {
              collection: collectionName,
              error,
            });
            sermonSnapshotsRef.current[collectionName] = [];
            publishMerged();
            toast.error("Unable to sync sermons");
          }
        );
      }
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [loadedSermonsTab]);

  useEffect(() => {
    if (!loadedArticlesTab) return;

    const articlesQuery = query(
      collection(db, "articles"),
      orderBy("dateCreated", "desc")
    );
    const unsubscribe = onSnapshot(
      articlesQuery,
      (snapshot) => {
        setArticles(
          snapshot.docs.map((docSnap) =>
            normalizeArticleFromFirestore(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
        );
        setArticlesLoading(false);
      },
      () => {
        toast.error("Unable to sync articles");
        setArticlesLoading(false);
      }
    );
    return () => unsubscribe();
  }, [loadedArticlesTab]);

  const publishedSongs = songs.filter((s) => s.published !== false).length;
  const publishedSermons = sermons.filter((s) => s.isPublished).length;
  const publishedArticles = articles.filter((a) => a.isPublished).length;

  function getAddHandler() {
    if (activeTab === "songs") {
      setSelectedSong(null);
      setSongModalOpen(true);
    } else if (activeTab === "sermons") {
      setSelectedSermon(null);
      setSermonModalOpen(true);
    } else {
      setSelectedArticle(null);
      setArticleModalOpen(true);
    }
  }

  const addLabel =
    activeTab === "songs"
      ? "Add Song"
      : activeTab === "sermons"
        ? "Add Sermon"
        : "Add Article";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Music2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                Dashboard
              </p>
              <h1 className="font-heading text-xl font-bold sm:text-2xl">
                Worship Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage songs, sermons, and articles
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={getAddHandler}
            className="gap-2 rounded-full px-5 font-semibold shadow"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AdminTab)}
        className="w-full space-y-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/50 p-1 sm:w-auto sm:inline-flex">
          <TabsTrigger value="songs" className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm">
            Songs
          </TabsTrigger>
          <TabsTrigger value="sermons" className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm">
            Sermons
          </TabsTrigger>
          <TabsTrigger value="articles" className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm">
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-0 space-y-4">
          {activeTab === "songs" ? (
            <>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: <ListMusic className="h-4 w-4" />, label: "Total Songs", value: songsLoading ? "—" : songs.length },
              { icon: <UploadCloud className="h-4 w-4" />, label: "Published", value: songsLoading ? "—" : publishedSongs },
              { icon: <Music2 className="h-4 w-4" />, label: "With Lyrics", value: songsLoading ? "—" : songs.filter((s) => s.originalLyrics?.trim() || s.lyrics?.trim()).length },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-4 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                <p className="font-heading text-xl font-bold sm:text-2xl">{stat.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <MusicList
            songs={songs}
            loading={songsLoading}
            onEdit={(song) => { setSelectedSong(song); setSongModalOpen(true); }}
            onDelete={() => {}}
          />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="sermons" className="mt-0 space-y-4">
          {activeTab === "sermons" ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: <Church className="h-4 w-4" />, label: "Total Sermons", value: sermonsLoading ? "—" : sermons.length },
              { icon: <Church className="h-4 w-4" />, label: "Published", value: sermonsLoading ? "—" : publishedSermons },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-4 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                <p className="font-heading text-xl font-bold sm:text-2xl">{stat.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <SermonList
            sermons={sermons}
            loading={sermonsLoading}
            onEdit={(sermon) => { setSelectedSermon(sermon); setSermonModalOpen(true); }}
            onDelete={() => {}}
          />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="articles" className="mt-0 space-y-4">
          {activeTab === "articles" ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: <FileText className="h-4 w-4" />, label: "Total Articles", value: articlesLoading ? "—" : articles.length },
              { icon: <FileText className="h-4 w-4" />, label: "Published", value: articlesLoading ? "—" : publishedArticles },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-4 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                <p className="font-heading text-xl font-bold sm:text-2xl">{stat.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <ArticleList
            articles={articles}
            loading={articlesLoading}
            onEdit={(article) => { setSelectedArticle(article); setArticleModalOpen(true); }}
            onDelete={() => {}}
          />
            </>
          ) : null}
        </TabsContent>
      </Tabs>

      <AddMusicModal
        isOpen={songModalOpen}
        onClose={() => { setSongModalOpen(false); setSelectedSong(null); }}
        onSave={() => { setSongModalOpen(false); setSelectedSong(null); }}
        initialSong={selectedSong}
      />
      <AddSermonModal
        isOpen={sermonModalOpen}
        onClose={() => { setSermonModalOpen(false); setSelectedSermon(null); }}
        onSave={() => { setSermonModalOpen(false); setSelectedSermon(null); }}
        initialSermon={selectedSermon}
      />
      <AddArticleModal
        isOpen={articleModalOpen}
        onClose={() => { setArticleModalOpen(false); setSelectedArticle(null); }}
        onSave={() => { setArticleModalOpen(false); setSelectedArticle(null); }}
        initialArticle={selectedArticle}
      />
    </div>
  );
}
