import { redirect } from "next/navigation";

export default function AdminSermonsPage() {
  redirect("/admin-worship-panel/content?tab=sermons");
}
