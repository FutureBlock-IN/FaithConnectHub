import { getWorshipCatalogCached } from "@/lib/cached-worship-data";

import { SearchMenuClient } from "./search-menu-client";

type NavbarSearchSectionProps = {
  className?: string;
};

export async function NavbarSearchSection({ className }: NavbarSearchSectionProps) {
  const catalog = await getWorshipCatalogCached();

  return <SearchMenuClient className={className} catalog={catalog} />;
}
