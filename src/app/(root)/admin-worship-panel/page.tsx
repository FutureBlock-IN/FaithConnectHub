import { Suspense } from "react";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 px-4 py-8 sm:px-6">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
