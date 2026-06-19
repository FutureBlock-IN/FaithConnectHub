import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Dashboard",
  description: "Your dashboard",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal worship dashboard.
        </p>
      </div>
    </RequireAuth>
  );
}
