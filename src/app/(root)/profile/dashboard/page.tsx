import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardPageClient } from "@/components/profile/dashboard/dashboard-page-client";
import { getPageChurchContext } from "@/lib/church-page-data";
import { getUpcomingEventsCached } from "@/lib/cached-event-data";

export const metadata = {
  title: "Dashboard",
  description: "Your personalized activity overview",
};

export default async function DashboardPage() {
  const { churchId } = await getPageChurchContext();
  const initialEvents = await getUpcomingEventsCached(churchId);

  return (
    <RequireAuth>
      <DashboardPageClient initialEvents={initialEvents} />
    </RequireAuth>
  );
}
