import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Profile",
  description: "Your profile",
};

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your account profile.
        </p>
      </div>
    </RequireAuth>
  );
}
