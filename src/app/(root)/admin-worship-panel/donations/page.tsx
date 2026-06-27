import { redirect } from "next/navigation";

export default function AdminDonationsPage() {
  redirect("/admin-worship-panel/content?tab=donations");
}
