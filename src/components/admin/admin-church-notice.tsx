"use client";

import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";

export function AdminChurchNotice() {
  if (!MULTI_CHURCH_ENABLED) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
      Select an active church to manage worship content. Super admins can use the
      church selector in the sidebar.
    </div>
  );
}
