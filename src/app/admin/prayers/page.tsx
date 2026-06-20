import { redirect } from "next/navigation";

export default function AdminPrayersRedirectPage() {
  redirect("/admin-worship-panel?tab=prayers");
}
