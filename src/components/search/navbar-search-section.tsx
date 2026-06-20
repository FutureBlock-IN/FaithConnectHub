import { WorshipCatalogProvider } from "@/context/worship-catalog-context";
import { getWorshipCatalogCached } from "@/lib/cached-worship-data";

import { SearchMenuClient } from "./search-menu-client";
import { WorshipTopItemsClient } from "./firebase-worship-top-items";

type NavbarSearchSectionProps = {
  className?: string;
};

export async function NavbarSearchSection({ className }: NavbarSearchSectionProps) {
  const catalog = await getWorshipCatalogCached();

  return (
    <WorshipCatalogProvider catalog={catalog}>
      <SearchMenuClient
        className={className}
        topSearch={
          <WorshipTopItemsClient
            songs={catalog.songs.slice(0, 12)}
            sermons={catalog.sermons.slice(0, 12)}
            articles={catalog.articles.slice(0, 12)}
          />
        }
      />
    </WorshipCatalogProvider>
  );
}
