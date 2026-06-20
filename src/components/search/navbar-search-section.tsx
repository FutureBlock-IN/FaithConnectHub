import { getPageChurchContext } from "@/lib/church-page-data";
import { getWorshipCatalogCached } from "@/lib/cached-worship-data";

import { SearchMenuClient } from "./search-menu-client";

type NavbarSearchSectionProps = {
  className?: string;
  placeholder?: string;
  enableShortcut?: boolean;
};

export async function NavbarSearchSection({
  className,
  placeholder,
  enableShortcut,
}: NavbarSearchSectionProps) {
  const { churchId } = await getPageChurchContext();
  const catalog = await getWorshipCatalogCached(churchId);

  return (
    <SearchMenuClient
      className={className}
      catalog={catalog}
      placeholder={placeholder}
      enableShortcut={enableShortcut}
    />
  );
}
