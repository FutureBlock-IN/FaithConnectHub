import { redirect } from "next/navigation";

export default function AdminEventsPage() {
  redirect("/admin-worship-panel/content?tab=events");
}
