"use client";

import React from "react";

import type { FirebaseArticle } from "@/types/firebase-article";
import type { FirebaseSermon } from "@/types/firebase-sermon";
import type { FirebaseSong } from "@/types/firebase-song";

import { ArticlesTabContent } from "@/components/worship/articles-tab-content";
import { SermonsTabContent } from "@/components/worship/sermons-tab-content";
import { SongsTabContent } from "@/components/worship/songs-tab-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorshipCollectionTab } from "@/hooks/use-store";

export type WorshipCollectionTab = "songs" | "sermons" | "articles";

type WorshipCollectionSectionProps = {
  songs: FirebaseSong[];
  sermons: FirebaseSermon[];
  articles: FirebaseArticle[];
};

export function WorshipCollectionSection({
  songs,
  sermons,
  articles,
}: WorshipCollectionSectionProps) {
  const [activeTab, setActiveTab] = useWorshipCollectionTab();

  return (
    <section className="w-full space-y-5">
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Worship Collection
        </p>
        <h2 className="font-heading text-xl font-bold sm:text-2xl md:text-3xl">
          Explore
        </h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as WorshipCollectionTab)
        }
        className="w-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/50 p-1 sm:w-auto sm:inline-flex">
          <TabsTrigger
            value="songs"
            className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Songs
          </TabsTrigger>
          <TabsTrigger
            value="sermons"
            className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Sermons
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-5 focus-visible:outline-none">
          {activeTab === "songs" ? (
            <SongsTabContent initialSongs={songs} />
          ) : null}
        </TabsContent>

        <TabsContent value="sermons" className="mt-5 focus-visible:outline-none">
          {activeTab === "sermons" ? (
            <SermonsTabContent initialSermons={sermons} />
          ) : null}
        </TabsContent>

        <TabsContent value="articles" className="mt-5 focus-visible:outline-none">
          {activeTab === "articles" ? (
            <ArticlesTabContent initialArticles={articles} />
          ) : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}
