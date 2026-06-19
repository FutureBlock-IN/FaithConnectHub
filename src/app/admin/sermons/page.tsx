import { redirect } from "next/navigation";

export default function AdminSermonsPage() {
  redirect("/admin-worship-panel?tab=sermons");
}
