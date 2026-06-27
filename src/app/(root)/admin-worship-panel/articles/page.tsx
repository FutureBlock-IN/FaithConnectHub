import { redirect } from "next/navigation";

export default function AdminArticlesPage() {
  redirect("/admin-worship-panel/content?tab=articles");
}
