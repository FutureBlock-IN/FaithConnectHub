import { RequireAuth } from "@/components/auth/require-auth";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";

export const metadata = {
  title: "My Favorites",
  description: "Your saved songs, sermons, and articles",
};

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesPageClient />
    </RequireAuth>
  );
}
