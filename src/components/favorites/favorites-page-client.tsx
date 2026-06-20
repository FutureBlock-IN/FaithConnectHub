"use client";

import { Heart, Loader2 } from "lucide-react";

import { FirebaseArticleCard } from "@/components/worship/firebase-article-card";
import { FirebaseSermonCard } from "@/components/worship/firebase-sermon-card";
import {
  FirebaseSongCard,
  songsAlbumGridClassName,
} from "@/components/music/firebase-song-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/context/favorites-context";
import { useResolvedFavoriteItems } from "@/hooks/use-resolved-favorite-items";

export function FavoritesPageClient() {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { songs, sermons, articles, loading: itemsLoading } =
    useResolvedFavoriteItems(favorites);

  const loading = favoritesLoading || itemsLoading;
  const totalCount = favorites.length;

  return (
    <div className="container space-y-6 py-8">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
          Your Library
        </p>
        <h1 className="font-heading text-3xl font-bold">My Favorites</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Songs, sermons, and articles you have saved. Updates instantly when you
          favorite or unfavorite items.
        </p>
      </div>

      {loading ?
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      : totalCount === 0 ?
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
          <Heart className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-4 text-sm font-medium">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any song, sermon, or article to save it here.
          </p>
        </div>
      : <Tabs defaultValue="songs" className="space-y-6">
          <TabsList className="grid h-auto w-full max-w-md grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/50 p-1">
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
            : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sermons.map((sermon) => (
                  <FirebaseSermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            }
          </TabsContent>

          <TabsContent value="articles" className="mt-0">
            {articles.length === 0 ?
              <EmptyTab message="No favorite articles yet." />
            : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
