"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { FirebaseArticleCard } from "@/components/worship/firebase-article-card";
import { FirebaseSermonCard } from "@/components/worship/firebase-sermon-card";
import {
  FirebaseSongCard,
  songsAlbumGridClassName,
} from "@/components/music/firebase-song-card";
import { WorshipGridSkeleton } from "@/components/skeletons/worship-grid-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FetchErrorBanner } from "@/components/ui/fetch-error-banner";
import { useFavorites } from "@/context/favorites-context";
import { useResolvedFavoriteItems } from "@/hooks/use-resolved-favorite-items";
import { pageContentClass, typePageTitleClass, contentCardGridClassName } from "@/lib/responsive-classes";

type FilterTab = "all" | "songs" | "sermons" | "articles";

export function FavoritesPageClient() {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { songs, sermons, articles, loading: itemsLoading, error: itemsError } =
    useResolvedFavoriteItems(favorites);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const loading = favoritesLoading || itemsLoading;
  const totalCount = favorites.length;

  const allCount = songs.length + sermons.length + articles.length;

  return (
    <div className={pageContentClass}>
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Your Library
        </p>
        <h1 className={typePageTitleClass}>My Favorites</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Songs, sermons, and articles you have saved. Tap the heart on any card
          to remove an item from favorites.
        </p>
      </div>

      {itemsError ?
        <FetchErrorBanner message={itemsError} />
      : null}

      {loading ?
        <WorshipGridSkeleton count={8} />
      : totalCount === 0 ?
        <EmptyState />
      : <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as FilterTab)}
          className="space-y-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-border/50 bg-muted/50 p-1 sm:max-w-2xl sm:grid-cols-4">
            <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="songs" className="rounded-lg text-xs sm:text-sm">
              Songs ({songs.length})
            </TabsTrigger>
            <TabsTrigger value="sermons" className="rounded-lg text-xs sm:text-sm">
              Sermons ({sermons.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="rounded-lg text-xs sm:text-sm">
              Articles ({articles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 space-y-8">
            <FavoritesSection
              title="Songs"
              emptyMessage="No favorite songs yet."
              isEmpty={songs.length === 0}
            >
              <div className={songsAlbumGridClassName}>
                {songs.map((song) => (
                  <FirebaseSongCard key={song.id} song={song} />
                ))}
              </div>
            </FavoritesSection>

            <FavoritesSection
              title="Sermons"
              emptyMessage="No favorite sermons yet."
              isEmpty={sermons.length === 0}
            >
              <div className={contentCardGridClassName}>
                {sermons.map((sermon) => (
                  <FirebaseSermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            </FavoritesSection>

            <FavoritesSection
              title="Articles"
              emptyMessage="No favorite articles yet."
              isEmpty={articles.length === 0}
            >
              <div className={contentCardGridClassName}>
                {articles.map((article) => (
                  <FirebaseArticleCard key={article.id} article={article} />
                ))}
              </div>
            </FavoritesSection>
          </TabsContent>

          <TabsContent value="songs" className="mt-0">
            {songs.length === 0 ?
              <EmptyTab message="No favorite songs yet." />
            : <div className={songsAlbumGridClassName}>
                {songs.map((song) => (
                  <FirebaseSongCard key={song.id} song={song} />
                ))}
              </div>
            }
          </TabsContent>

          <TabsContent value="sermons" className="mt-0">
            {sermons.length === 0 ?
              <EmptyTab message="No favorite sermons yet." />
            : <div className={contentCardGridClassName}>
                {sermons.map((sermon) => (
                  <FirebaseSermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            }
          </TabsContent>

          <TabsContent value="articles" className="mt-0">
            {articles.length === 0 ?
              <EmptyTab message="No favorite articles yet." />
            : <div className={contentCardGridClassName}>
                {articles.map((article) => (
                  <FirebaseArticleCard key={article.id} article={article} />
                ))}
              </div>
            }
          </TabsContent>
        </Tabs>
      }
    </div>
  );
}

function FavoritesSection({
  title,
  emptyMessage,
  isEmpty,
  children,
}: {
  title: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  if (isEmpty) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <EmptyTab message={emptyMessage} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
      <Heart className="mx-auto size-8 text-muted-foreground/60" />
      <p className="mt-4 text-sm font-medium">No favorites yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the heart on any song, sermon, or article to save it here.
      </p>
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
