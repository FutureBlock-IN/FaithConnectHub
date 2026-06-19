"use client";

import React, { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import type { FirebaseSermon } from "@/types/firebase-sermon";

import { FirebaseSermonCard } from "@/components/worship/firebase-sermon-card";
import { CollectionTabHeader } from "@/components/worship/collection-tab-header";
import { worshipContentGridClassName } from "@/components/worship/worship-card-styles";
import { TabEmptyState, TabLoadingState } from "@/components/worship/songs-tab-content";
import { db } from "@/lib/firebase";
import {
  LEGACY_SERMONS_COLLECTION,
  SERMONS_COLLECTION,
  mergeSermonsById,
  normalizeSermonFromFirestore,
} from "@/lib/sermon-firestore";

type SermonsTabContentProps = {
  initialSermons: FirebaseSermon[];
};

export function SermonsTabContent({
  initialSermons,
}: SermonsTabContentProps) {
  const [sermons, setSermons] = useState<FirebaseSermon[]>(initialSermons);
  const [loading, setLoading] = useState(!initialSermons.length);
  const snapshotsRef = useRef<Record<string, FirebaseSermon[]>>({});

  useEffect(() => {
    snapshotsRef.current = {};

    function publishMerged() {
      const merged = mergeSermonsById(Object.values(snapshotsRef.current)).filter(
        (s) => s.isPublished
      );
      console.info("[SermonsTabContent] merged published sermons", {
        count: merged.length,
        byCollection: Object.fromEntries(
          Object.entries(snapshotsRef.current).map(([name, items]) => [
            name,
            items.length,
          ])
        ),
      });
      setSermons(merged);
      setLoading(false);
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
            snapshotsRef.current[collectionName] = snapshot.docs.map((docSnap) =>
              normalizeSermonFromFirestore(
                docSnap.id,
                docSnap.data() as Record<string, unknown>
              )
            );
            console.info("[SermonsTabContent] snapshot", {
              collection: collectionName,
              count: snapshot.docs.length,
            });
            publishMerged();
          },
          (error) => {
            console.error("[SermonsTabContent] Firestore snapshot failed", {
              collection: collectionName,
              error,
            });
            snapshotsRef.current[collectionName] = [];
            publishMerged();
          }
        );
      }
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  if (loading) {
    return <TabLoadingState label="Loading sermons..." />;
  }

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
