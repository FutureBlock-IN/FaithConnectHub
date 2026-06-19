"use client";

import React, { useMemo } from "react";

import type { FirebaseSermon } from "@/types/firebase-sermon";

import { FirebaseSermonCard } from "@/components/worship/firebase-sermon-card";
import { CollectionTabHeader } from "@/components/worship/collection-tab-header";
import { worshipContentGridClassName } from "@/components/worship/worship-card-styles";
import { TabEmptyState } from "@/components/worship/songs-tab-content";

type SermonsTabContentProps = {
  initialSermons: FirebaseSermon[];
};

export function SermonsTabContent({
  initialSermons,
}: SermonsTabContentProps) {
  const sermons = useMemo(
    () => initialSermons.filter((sermon) => sermon.isPublished),
    [initialSermons]
  );

  if (sermons.length === 0) {
    return <TabEmptyState message="No Sermons Found" />;
  }

  return (
    <>
      <CollectionTabHeader title="Sermons" count={sermons.length} />
      <div className={worshipContentGridClassName}>
        {sermons.map((sermon) => (
          <FirebaseSermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
    </>
  );
}
