"use client";



import React, { useMemo } from "react";

import type { FirebaseSermon } from "@/types/firebase-sermon";

import { useWorshipCatalog } from "@/context/worship-catalog-context";

import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";

import {

  filterArticlesLocal,

  filterSermonsLocal,

  filterSongsLocal,

} from "@/lib/worship-search-utils";

import { getSongAlternateTitle, getSongDisplayTitle } from "@/lib/song-firestore";



import { SearchResultRow } from "./search-result-row";



type FirebaseWorshipSearchProps = {

  query: string;

};



function getSermonSubtitle(sermon: FirebaseSermon): string | undefined {

  return sermon.shortDescription?.trim() || sermon.subtitle?.trim() || undefined;

}



export function FirebaseWorshipSearch({ query }: FirebaseWorshipSearchProps) {

  const catalog = useWorshipCatalog();

  const { activeTab } = useEffectiveWorshipCollectionTab();



  const songs = useMemo(

    () => (catalog ? filterSongsLocal(catalog.songs, query) : []),

    [catalog, query]

  );

  const sermons = useMemo(

    () => (catalog ? filterSermonsLocal(catalog.sermons, query) : []),

    [catalog, query]

  );

  const articles = useMemo(

    () => (catalog ? filterArticlesLocal(catalog.articles, query) : []),

    [catalog, query]

  );



  if (!query.trim()) return null;



  if (!catalog) {

    return (

      <div className="py-4 text-center text-xs text-muted-foreground">

        Search is loading...

      </div>

    );

  }



  const hasResults =

    activeTab === "songs"

      ? songs.length > 0

      : activeTab === "sermons"

        ? sermons.length > 0

        : articles.length > 0;



  if (!hasResults) {

    const emptyMessage =

      activeTab === "songs"

        ? "No Songs Found"

        : activeTab === "sermons"

          ? "No Sermons Found"

          : "No Articles Found";



    return (

      <div className="py-6 text-center text-sm text-muted-foreground">

        {emptyMessage}

      </div>

    );

  }



  const sectionLabel =

    activeTab === "songs"

      ? "Songs"

      : activeTab === "sermons"

        ? "Sermons"

        : "Articles";



  return (

    <div className="w-full space-y-3 py-4">

      <p className="font-heading text-lg font-semibold">{sectionLabel}</p>



      <div className="flex max-h-96 w-full flex-col gap-2 overflow-y-auto pr-2">

        {activeTab === "songs" &&

          songs.map((song) => (

            <SearchResultRow

              key={song.id}

              href={`/songs/${encodeURIComponent(song.id)}`}

              title={getSongDisplayTitle(song)}

              subtitle={getSongAlternateTitle(song)}

              coverUrl={song.imageUrl}

            />

          ))}



        {activeTab === "sermons" &&

          sermons.map((sermon) => (

            <SearchResultRow

              key={sermon.id}

              href={`/sermons/${encodeURIComponent(sermon.id)}`}

              title={sermon.title}

              subtitle={getSermonSubtitle(sermon)}

              coverUrl={sermon.coverImage}

            />

          ))}



        {activeTab === "articles" &&

          articles.map((article) => (

            <SearchResultRow

              key={article.id}

              href={`/articles/${encodeURIComponent(article.id)}`}

              title={article.title}

              subtitle={article.shortDescription}

              coverUrl={article.coverImage}

            />

          ))}

      </div>

    </div>

  );

}

