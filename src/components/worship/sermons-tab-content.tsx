"use client";

import React, { useMemo } from "react";

import type { FirebaseSermon } from "@/types/firebase-sermon";

import { FirebaseSermonCard } from "@/components/worship/firebase-sermon-card";
import { CollectionTabHeader } from "@/components/worship/collection-tab-header";
import { worshipContentGridClassName } from "@/components/worship/worship-card-styles";
import { TabEmptyState } from "@/components/worship/songs-tab-content";
import { useRealtimeSermons } from "@/hooks/use-worship-realtime";

type SermonsTabContentProps = {
  initialSermons: FirebaseSermon[];
};

export function SermonsTabContent({
  initialSermons,
}: SermonsTabContentProps) {
  const liveSermons = useRealtimeSermons(initialSermons);
  const sermons = useMemo(
    () => liveSermons.filter((sermon) => sermon.isPublished),
    [liveSermons]
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
