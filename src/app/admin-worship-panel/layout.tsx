import { RequireAdmin } from "@/components/auth/require-admin";
import { AdminPanelHeader } from "@/components/admin/admin-panel-header";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata(
  "Admin Panel",
  "FaithConnectHub admin content management panel."
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        <AdminPanelHeader />
        <main id="admin-panel-content">{children}</main>
      </div>
    </RequireAdmin>
  );
}
