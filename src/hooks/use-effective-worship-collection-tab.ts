"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import type { WorshipCollectionTab } from "@/hooks/use-store";
import { useWorshipCollectionTab } from "@/hooks/use-store";
import { getContentTypeFromPathname } from "@/lib/worship-collection";

export function useEffectiveWorshipCollectionTab() {
  const pathname = usePathname();
  const [storedTab, setStoredTab] = useWorshipCollectionTab();
  const routeTab = getContentTypeFromPathname(pathname);

  useEffect(() => {
    if (routeTab && routeTab !== storedTab) {
      setStoredTab(routeTab);
    }
  }, [routeTab, storedTab, setStoredTab]);

  const activeTab: WorshipCollectionTab = routeTab ?? storedTab;

  return {
    activeTab,
    setActiveTab: setStoredTab,
    isRouteLocked: routeTab !== null,
  };
}
