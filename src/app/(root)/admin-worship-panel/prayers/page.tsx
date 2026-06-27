import { redirect } from "next/navigation";

export default function AdminPrayersPage() {
  redirect("/admin-worship-panel/content?tab=prayers");
}
