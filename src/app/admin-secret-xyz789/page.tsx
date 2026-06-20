"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

import type { FirebaseSong } from "@/types/firebase-song";

import { Button } from "@/components/ui/button";
import { AddMusicModal } from "@/components/admin/add-music-modal";
import { MusicList } from "@/components/admin/music-list";
import { useAdminChurchId } from "@/hooks/use-admin-church-id";
import { normalizeSongFromFirestore } from "@/lib/song-firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const adminChurchId = useAdminChurchId();
  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<FirebaseSong | null>(null);

  useEffect(() => {
    if (!adminChurchId) {
      setSongs([]);
      setLoading(false);
      return;
    }

    const songsQuery = query(
      collection(db, "songs"),
      where("churchId", "==", adminChurchId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      songsQuery,
      (snapshot) => {
        setSongs(
          snapshot.docs.map((doc) =>
            normalizeSongFromFirestore(doc.id, doc.data())
          )
        );
        setLoading(false);
      },
      (error) => {
        console.error("[AdminPage] Firestore snapshot failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminChurchId]);

  function handleAddMusic() {
    console.log("[AdminPage] Opening Add Music modal");
    setSelectedSong(null);
    setIsModalOpen(true);
  }

  function handleEditSong(song: FirebaseSong) {
    console.log("[AdminPage] Opening Edit modal for song:", song.id);
    setSelectedSong(song);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    console.log("[AdminPage] Closing modal");
    setIsModalOpen(false);
    setSelectedSong(null);
  }

  function handleSongSaved() {
    console.log("[AdminPage] Song saved, closing modal");
    handleCloseModal();
  }

  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Music Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Manage songs, uploads, and lyrics
          </p>
        </div>

        <Button size="lg" onClick={handleAddMusic} className="gap-2">
          <Plus className="h-5 w-5" />
          Add Music
        </Button>
      </div>

      <AddMusicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSongSaved}
        initialSong={selectedSong}
        churchId={adminChurchId ?? ""}
      />

      <MusicList
        songs={songs}
        loading={loading}
        onEdit={handleEditSong}
        onDelete={() => {
          /* Real-time snapshot keeps songs current */
        }}
      />
    </div>
  );
}
