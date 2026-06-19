import { redirect } from "next/navigation";

export default function AdminSongsPage() {
  redirect("/admin-worship-panel?tab=songs");
}
