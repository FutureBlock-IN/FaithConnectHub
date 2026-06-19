// "use client";

// import React, { useEffect, useState } from "react";
// import { Loader2, Upload, X } from "lucide-react";
// import { toast } from "sonner";

// import type { FirebaseSong } from "@/types/firebase-song";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { addSong, updateSong } from "@/lib/firebase-queries";
// import { uploadSongFileLocal } from "@/lib/local-upload";
// import {
//   MAX_AUDIO_SIZE_LABEL,
//   MAX_IMAGE_SIZE_LABEL,
//   validateAudioFile,
//   validateImageFile,
// } from "@/lib/upload-limits";

// type AddMusicModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: () => void;
//   initialSong?: FirebaseSong | null;
// };

// type UploadProgress = {
//   cover: number;
//   audio: number;
// };

// function UploadProgressBar({
//   label,
//   percent,
// }: {
//   label: string;
//   percent: number;
// }) {
//   if (percent <= 0) return null;

//   return (
//     <div className="space-y-1">
//       <div className="flex justify-between text-xs text-muted-foreground">
//         <span>{label}</span>
//         <span>{percent}%</span>
//       </div>
//       <div className="h-2 overflow-hidden rounded-full bg-muted">
//         <div
//           className="h-full rounded-full bg-primary transition-all duration-200"
//           style={{ width: `${percent}%` }}
//         />
//       </div>
//     </div>
//   );
// }

// export function AddMusicModal({
//   isOpen,
//   onClose,
//   onSave,
//   initialSong,
// }: AddMusicModalProps) {
//   const [formData, setFormData] = useState({
//     title: "",
//     lyrics: "",
//     transliteratedLyrics: "",
//     youtubeUrl: "",
//   });

//   const [files, setFiles] = useState<{
//     cover?: File;
//     audio?: File;
//   }>({});

//   const [coverPreview, setCoverPreview] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
//     cover: 0,
//     audio: 0,
//   });

//   useEffect(() => {
//     if (isOpen) {
//       console.info("[AddMusicModal] Modal opened - ready for local uploads");
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (initialSong) {
//       setFormData({
//         title: initialSong.title,
//         lyrics: initialSong.lyrics || "",
//         transliteratedLyrics: initialSong.transliteratedLyrics || "",
//         youtubeUrl: initialSong.youtubeUrl || "",
//       });
//       setCoverPreview(initialSong.imageUrl || "");
//       setFiles({});
//     } else {
//       setFormData({
//         title: "",
//         lyrics: "",
//         transliteratedLyrics: "",
//         youtubeUrl: "",
//       });
//       setCoverPreview("");
//       setFiles({});
//     }
//     setUploadProgress({ cover: 0, audio: 0 });
//   }, [initialSong, isOpen]);

//   function handleInputChange(
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }

//   function isValidYouTubeUrl(url: string) {
//     if (!url) return true;
//     // Accept youtube.com and youtu.be links and embed links
//     const re = /(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)/i;
//     return re.test(url.trim());
//   }

//   function handleFileChange(
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "cover" | "audio"
//   ) {
//     const file = e.target.files?.[0];
//     if (file) {
//       const error =
//         type === "cover" ? validateImageFile(file) : validateAudioFile(file);
//       if (error) {
//         toast.error(error);
//         e.target.value = "";
//         return;
//       }

//       setFiles((prev) => ({ ...prev, [type]: file }));

//       if (type === "cover") {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setCoverPreview(reader.result as string);
//         };
//         reader.readAsDataURL(file);
//       }
//     }
//   }

//   async function uploadFile(
//     songId: string,
//     fileType: "cover" | "audio",
//     file: File,
//     onProgress?: (percent: number) => void
//   ): Promise<string> {
//     onProgress?.(10);
//     console.log(`[AddMusicModal] Uploading ${fileType}:`, {
//       songId,
//       fileName: file.name,
//       fileSize: file.size,
//     });

//     const formData = new FormData();
//     formData.append("file", file);
//     onProgress?.(30);

//     try {
//       const url = await uploadSongFileLocal(songId, fileType, formData, (percent) => {
//         onProgress?.(30 + (percent * 0.7)); // Scale from 30% to 100%
//       });
//       console.log(`[AddMusicModal] ${fileType} uploaded successfully:`, {
//         songId,
//         url,
//       });
//       return url;
//     } catch (error) {
//       console.error(`[AddMusicModal] ${fileType} upload failed:`, error);
//       throw error;
//     }
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     if (!formData.title.trim()) {
//       toast.error("Song title is required");
//       return;
//     }

//     if (files.cover) {
//       const coverError = validateImageFile(files.cover);
//       if (coverError) {
//         toast.error(coverError);
//         return;
//       }
//     }

//     if (files.audio) {
//       const audioError = validateAudioFile(files.audio);
//       if (audioError) {
//         toast.error(audioError);
//         return;
//       }
//     }

//     if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
//       toast.error("YouTube URL must be a valid youtube.com or youtu.be link");
//       return;
//     }

//     setLoading(true);
//     setUploadProgress({ cover: 0, audio: 0 });

//     try {
//       if (initialSong) {
//         // Update existing song
//         console.log("[AddMusicModal] Updating existing song:", initialSong.id);

//         // Update metadata first
//         await updateSong(initialSong.id, {
//           title: formData.title.trim(),
//           lyrics: formData.lyrics,
//           transliteratedLyrics: formData.transliteratedLyrics,
//           youtubeUrl: formData.youtubeUrl?.trim() || "",
//         });

//         const updates: { imageUrl?: string; audioUrl?: string; youtubeUrl?: string } = {}
//       ;

//         // Upload cover if provided
//         if (files.cover) {
//           updates.imageUrl = await uploadFile(
//             initialSong.id,
//             "cover",
//             files.cover,
//             (percent) =>
//               setUploadProgress((prev) => ({ ...prev, cover: percent }))
//           );
//         }

//         // Upload audio if provided
//         if (files.audio) {
//           updates.audioUrl = await uploadFile(
//             initialSong.id,
//             "audio",
//             files.audio,
//             (percent) =>
//               setUploadProgress((prev) => ({ ...prev, audio: percent }))
//           );
//         }

//         // Update URLs in Firestore
//         if (Object.keys(updates).length > 0) {
//           await updateSong(initialSong.id, updates);
//           console.log("[AddMusicModal] Song updated with new files:", updates);
//         }

//         toast.success("Song updated successfully");
//       } else {
//         // Create new song
//         console.log("[AddMusicModal] Creating new song");

//         // Add song to Firestore with empty URLs
//         const songId = await addSong({
//           title: formData.title.trim(),
//           lyrics: formData.lyrics,
//           transliteratedLyrics: formData.transliteratedLyrics,
//           imageUrl: "",
//           audioUrl: "",
//           youtubeUrl: formData.youtubeUrl?.trim() || "",
//         });

//         console.log("[AddMusicModal] Song created:", songId);

//         const updates: { imageUrl?: string; audioUrl?: string; youtubeUrl?: string } = {};

//         // Upload cover image if provided
//         if (files.cover) {
//           const imageUrl = await uploadFile(
//             songId,
//             "cover",
//             files.cover,
//             (percent) =>
//               setUploadProgress((prev) => ({ ...prev, cover: percent }))
//           );
//           updates.imageUrl = imageUrl;
//         }

//         // Upload audio file if provided
//         if (files.audio) {
//           const audioUrl = await uploadFile(
//             songId,
//             "audio",
//             files.audio,
//             (percent) =>
//               setUploadProgress((prev) => ({ ...prev, audio: percent }))
//           );
//           updates.audioUrl = audioUrl;
//         }

//         // Update Firestore with file URLs if any files were uploaded
//         if (Object.keys(updates).length > 0) {
//           await updateSong(songId, updates);
//           console.log("[AddMusicModal] Song finalized with files:", {
//             songId,
//             ...updates,
//           });
//         }

//         toast.success("Song added successfully");
//       }

//       // Close modal and reload songs
//       onSave();
//       setFormData({ title: "", lyrics: "", transliteratedLyrics: "", youtubeUrl: "" });
//       setFiles({});
//       setCoverPreview("");
//     } catch (error) {
//       console.error("[AddMusicModal] Error saving song:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to save song"
//       );
//     } finally {
//       setLoading(false);
//       setUploadProgress({ cover: 0, audio: 0 });
//     }
//   }

//   return (
//     <Dialog
//       open={isOpen}
//       onOpenChange={(open) => {
//         if (!open && !loading) onClose();
//       }}
//     >
//       <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {initialSong ? "Edit Song" : "Add New Music"}
//           </DialogTitle>
//           <DialogDescription>
//             {initialSong
//               ? "Update song details, cover, audio, or lyrics"
//               : "Add a new song with cover image and audio file"}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="title">Song Title *</Label>
//             <Input
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               placeholder="Enter song title"
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="cover">Cover Image</Label>
//             <p className="text-xs text-muted-foreground">
//               Max {MAX_IMAGE_SIZE_LABEL}
//             </p>
//             <div className="flex gap-4">
//               {coverPreview && (
//                 <div className="relative h-20 w-20 shrink-0">
//                   <img
//                     src={coverPreview}
//                     alt="Cover preview"
//                     className="h-full w-full rounded object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCoverPreview(initialSong?.imageUrl ?? "");
//                       setFiles((prev) => {
//                         const next = { ...prev };
//                         delete next.cover;
//                         return next;
//                       });
//                     }}
//                     className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
//                     disabled={loading}
//                   >
//                     <X className="h-3 w-3" />
//                   </button>
//                 </div>
//               )}
//               <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
//                 <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
//                 <span className="text-xs font-medium">Click to upload</span>
//                 <input
//                   type="file"
//                   id="cover"
//                   accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/*"
//                   onChange={(e) => handleFileChange(e, "cover")}
//                   className="hidden"
//                   disabled={loading}
//                 />
//               </label>
//             </div>
//             <UploadProgressBar label="Cover upload" percent={uploadProgress.cover} />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="audio">Audio File</Label>
//             <p className="text-xs text-muted-foreground">
//               Max {MAX_AUDIO_SIZE_LABEL}
//             </p>
//             {files.audio && (
//               <div className="mb-2 flex items-center justify-between rounded-lg bg-muted p-2">
//                 <span className="truncate text-sm">{files.audio.name}</span>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setFiles((prev) => {
//                       const next = { ...prev };
//                       delete next.audio;
//                       return next;
//                     });
//                   }}
//                   className="rounded-full p-1 hover:bg-destructive/20"
//                   disabled={loading}
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             )}
//             <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
//               <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
//               <span className="text-xs font-medium">Click to upload</span>
//               <input
//                 type="file"
//                 id="audio"
//                 accept=".mp3,.wav,.m4a,audio/*"
//                 onChange={(e) => handleFileChange(e, "audio")}
//                 className="hidden"
//                 disabled={loading}
//               />
//             </label>
//             <UploadProgressBar label="Audio upload" percent={uploadProgress.audio} />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="lyrics">Telugu Lyrics</Label>
//             <Textarea
//               id="lyrics"
//               name="lyrics"
//               value={formData.lyrics}
//               onChange={handleInputChange}
//               placeholder="Enter Telugu lyrics..."
//               rows={5}
//               disabled={loading}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="transliteratedLyrics">
//               English Transliteration Lyrics
//             </Label>
//             <Textarea
//               id="transliteratedLyrics"
//               name="transliteratedLyrics"
//               value={formData.transliteratedLyrics}
//               onChange={handleInputChange}
//               placeholder="Enter English transliteration lyrics..."
//               rows={5}
//               disabled={loading}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="youtubeUrl">YouTube Video URL (optional)</Label>
//             <Input
//               id="youtubeUrl"
//               name="youtubeUrl"
//               value={formData.youtubeUrl}
//               onChange={handleInputChange}
//               placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
//               disabled={loading}
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onClose}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading} className="gap-2">
//               {loading ?
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   {uploadProgress.cover > 0 || uploadProgress.audio > 0 ?
//                     "Uploading..."
//                   : "Saving..."}
//                 </>
//               : "Save Song"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


// Claude code - 1
"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import type { FirebaseSong } from "@/types/firebase-song";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addSong, updateSong } from "@/lib/firebase-queries";
import { notifyIfNewlyPublished } from "@/lib/notify-if-published";
import { uploadSongFileLocal } from "@/lib/local-upload";
import {
  MAX_AUDIO_SIZE_LABEL,
  MAX_IMAGE_SIZE_LABEL,
  validateAudioFile,
  validateImageFile,
} from "@/lib/upload-limits";

type AddMusicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialSong?: FirebaseSong | null;
};

type UploadProgress = {
  cover: number;
  audio: number;
};

function UploadProgressBar({ label, percent }: { label: string; percent: number }) {
  if (percent <= 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function AddMusicModal({ isOpen, onClose, onSave, initialSong }: AddMusicModalProps) {
  const [formData, setFormData] = useState({
    englishTitle: "",
    teluguTitle: "",
    lyrics: "",
    transliteratedLyrics: "",
    youtubeUrl: "",
  });

  const [files, setFiles] = useState<{ cover?: File; audio?: File }>({});
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ cover: 0, audio: 0 });

  useEffect(() => {
    if (initialSong) {
      setFormData({
        // Populate from new fields, fall back to legacy title
        englishTitle: initialSong.englishTitle ?? initialSong.title ?? "",
        teluguTitle: initialSong.teluguTitle ?? "",
        lyrics: initialSong.lyrics || "",
        transliteratedLyrics: initialSong.transliteratedLyrics || "",
        youtubeUrl: initialSong.youtubeUrl || "",
      });
      setCoverPreview(initialSong.imageUrl || "");
      setFiles({});
    } else {
      setFormData({ englishTitle: "", teluguTitle: "", lyrics: "", transliteratedLyrics: "", youtubeUrl: "" });
      setCoverPreview("");
      setFiles({});
    }
    setUploadProgress({ cover: 0, audio: 0 });
  }, [initialSong, isOpen]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function isValidYouTubeUrl(url: string) {
    if (!url) return true;
    return /(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)/i.test(url.trim());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "audio") {
    const file = e.target.files?.[0];
    if (file) {
      const error = type === "cover" ? validateImageFile(file) : validateAudioFile(file);
      if (error) { toast.error(error); e.target.value = ""; return; }
      setFiles((prev) => ({ ...prev, [type]: file }));
      if (type === "cover") {
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  }

  async function uploadFile(
    songId: string,
    fileType: "cover" | "audio",
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    onProgress?.(10);
    const fd = new FormData();
    fd.append("file", file);
    onProgress?.(30);
    const url = await uploadSongFileLocal(songId, fileType, fd, (percent) => {
      onProgress?.(30 + percent * 0.7);
    });
    return url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.englishTitle.trim()) {
      toast.error("English title is required");
      return;
    }
    if (!formData.teluguTitle.trim()) {
      toast.error("Telugu title is required");
      return;
    }
    if (files.cover && validateImageFile(files.cover)) { toast.error(validateImageFile(files.cover)!); return; }
    if (files.audio && validateAudioFile(files.audio)) { toast.error(validateAudioFile(files.audio)!); return; }
    if (formData.youtubeUrl && !isValidYouTubeUrl(formData.youtubeUrl)) {
      toast.error("YouTube URL must be a valid youtube.com or youtu.be link");
      return;
    }

    setLoading(true);
    setUploadProgress({ cover: 0, audio: 0 });

    try {
      // Use englishTitle as the legacy `title` field for backward compatibility
      const titleForLegacy = formData.englishTitle.trim();

      if (initialSong) {
        await updateSong(initialSong.id, {
          title: titleForLegacy,
          englishTitle: formData.englishTitle.trim(),
          teluguTitle: formData.teluguTitle.trim(),
          lyrics: formData.lyrics,
          transliteratedLyrics: formData.transliteratedLyrics,
          youtubeUrl: formData.youtubeUrl?.trim() || "",
        });

        const updates: { imageUrl?: string; audioUrl?: string } = {};
        if (files.cover) {
          updates.imageUrl = await uploadFile(initialSong.id, "cover", files.cover,
            (p) => setUploadProgress((prev) => ({ ...prev, cover: p })));
        }
        if (files.audio) {
          updates.audioUrl = await uploadFile(initialSong.id, "audio", files.audio,
            (p) => setUploadProgress((prev) => ({ ...prev, audio: p })));
        }
        if (Object.keys(updates).length > 0) await updateSong(initialSong.id, updates);

        toast.success("Song updated successfully");
      } else {
        const songId = await addSong({
          title: titleForLegacy,
          englishTitle: formData.englishTitle.trim(),
          teluguTitle: formData.teluguTitle.trim(),
          lyrics: formData.lyrics,
          transliteratedLyrics: formData.transliteratedLyrics,
          imageUrl: "",
          audioUrl: "",
          youtubeUrl: formData.youtubeUrl?.trim() || "",
        });

        const updates: { imageUrl?: string; audioUrl?: string } = {};
        if (files.cover) {
          updates.imageUrl = await uploadFile(songId, "cover", files.cover,
            (p) => setUploadProgress((prev) => ({ ...prev, cover: p })));
        }
        if (files.audio) {
          updates.audioUrl = await uploadFile(songId, "audio", files.audio,
            (p) => setUploadProgress((prev) => ({ ...prev, audio: p })));
        }
        if (Object.keys(updates).length > 0) await updateSong(songId, updates);

        await notifyIfNewlyPublished({
          type: "song",
          contentId: songId,
          contentTitle: formData.englishTitle.trim() || titleForLegacy,
          image: updates.imageUrl ?? "",
          isPublished: true,
        });

        toast.success("Song added successfully");
      }

      onSave();
      setFormData({ englishTitle: "", teluguTitle: "", lyrics: "", transliteratedLyrics: "", youtubeUrl: "" });
      setFiles({});
      setCoverPreview("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save song");
    } finally {
      setLoading(false);
      setUploadProgress({ cover: 0, audio: 0 });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !loading) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialSong ? "Edit Song" : "Add New Music"}</DialogTitle>
          <DialogDescription>
            {initialSong ? "Update song details, cover, audio, or lyrics" : "Add a new song with cover image and audio file"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── English Title ── */}
          <div className="space-y-2">
            <Label htmlFor="englishTitle">English Title *</Label>
            <Input
              id="englishTitle"
              name="englishTitle"
              value={formData.englishTitle}
              onChange={handleInputChange}
              placeholder="e.g. Neeve Prabhudavu"
              required
              disabled={loading}
            />
          </div>

          {/* ── Telugu Title ── */}
          <div className="space-y-2">
            <Label htmlFor="teluguTitle">Telugu Title *</Label>
            <Input
              id="teluguTitle"
              name="teluguTitle"
              value={formData.teluguTitle}
              onChange={handleInputChange}
              placeholder="e.g. నీవే ప్రభుదవు"
              required
              disabled={loading}
            />
          </div>

          {/* ── Cover Image ── */}
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <p className="text-xs text-muted-foreground">Max {MAX_IMAGE_SIZE_LABEL}</p>
            <div className="flex gap-4">
              {coverPreview && (
                <div className="relative h-20 w-20 shrink-0">
                  <img src={coverPreview} alt="Cover preview" className="h-full w-full rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(initialSong?.imageUrl ?? ""); setFiles((prev) => { const n = { ...prev }; delete n.cover; return n; }); }}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
                <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium">Click to upload</span>
                <input type="file" id="cover" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/*"
                  onChange={(e) => handleFileChange(e, "cover")} className="hidden" disabled={loading} />
              </label>
            </div>
            <UploadProgressBar label="Cover upload" percent={uploadProgress.cover} />
          </div>

          {/* ── Audio File ── */}
          <div className="space-y-2">
            <Label htmlFor="audio">Audio File</Label>
            <p className="text-xs text-muted-foreground">Max {MAX_AUDIO_SIZE_LABEL}</p>
            {files.audio && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-muted p-2">
                <span className="truncate text-sm">{files.audio.name}</span>
                <button type="button"
                  onClick={() => setFiles((prev) => { const n = { ...prev }; delete n.audio; return n; })}
                  className="rounded-full p-1 hover:bg-destructive/20" disabled={loading}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-4 transition-colors hover:border-primary">
              <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium">Click to upload</span>
              <input type="file" id="audio" accept=".mp3,.wav,.m4a,audio/*"
                onChange={(e) => handleFileChange(e, "audio")} className="hidden" disabled={loading} />
            </label>
            <UploadProgressBar label="Audio upload" percent={uploadProgress.audio} />
          </div>

          {/* ── Telugu Lyrics ── */}
          <div className="space-y-2">
            <Label htmlFor="lyrics">Telugu Lyrics</Label>
            <Textarea id="lyrics" name="lyrics" value={formData.lyrics} onChange={handleInputChange}
              placeholder="Enter Telugu lyrics..." rows={5} disabled={loading} />
          </div>

          {/* ── English Transliteration ── */}
          <div className="space-y-2">
            <Label htmlFor="transliteratedLyrics">English Transliteration Lyrics</Label>
            <Textarea id="transliteratedLyrics" name="transliteratedLyrics"
              value={formData.transliteratedLyrics} onChange={handleInputChange}
              placeholder="Enter English transliteration lyrics..." rows={5} disabled={loading} />
          </div>

          {/* ── YouTube URL ── */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube Video URL (optional)</Label>
            <Input id="youtubeUrl" name="youtubeUrl" value={formData.youtubeUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
              disabled={loading} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress.cover > 0 || uploadProgress.audio > 0 ? "Uploading..." : "Saving..."}
                </>
              ) : "Save Song"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}