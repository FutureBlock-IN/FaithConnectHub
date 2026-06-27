"use server";

import { getWorshipCatalogCached } from "@/lib/cached-worship-data";

export async function fetchWorshipCatalogAction(churchId: string) {
  return getWorshipCatalogCached(churchId);
}
