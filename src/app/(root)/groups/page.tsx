import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Groups",
  description: "Your worship groups",
};

export default function GroupsPage() {
  return (
    <RequireAuth>
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold">Groups</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and join worship groups.
        </p>
      </div>
    </RequireAuth>
  );
}
