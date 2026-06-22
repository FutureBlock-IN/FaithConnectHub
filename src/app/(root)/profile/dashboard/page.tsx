import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardPageClient } from "@/components/profile/dashboard/dashboard-page-client";

export const metadata = {
  title: "Dashboard",
  description: "Your personalized activity overview",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardPageClient />
    </RequireAuth>
  );
}
