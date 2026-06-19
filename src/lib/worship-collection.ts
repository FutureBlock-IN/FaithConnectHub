import type { WorshipCollectionTab } from "@/hooks/use-store";

export function getContentTypeFromPathname(
  pathname: string
): WorshipCollectionTab | null {
  if (pathname.startsWith("/articles")) return "articles";
  if (pathname.startsWith("/sermons")) return "sermons";
  if (pathname.startsWith("/songs")) return "songs";
  return null;
}

export function getSearchPlaceholder(tab: WorshipCollectionTab): string {
  switch (tab) {
    case "songs":
      return "Search songs...";
    case "sermons":
      return "Search sermons...";
    case "articles":
      return "Search articles...";
  }
}

export function getContentTypeLabel(tab: WorshipCollectionTab): string {
  switch (tab) {
    case "songs":
      return "Songs";
    case "sermons":
      return "Sermons";
    case "articles":
      return "Articles";
  }
}
