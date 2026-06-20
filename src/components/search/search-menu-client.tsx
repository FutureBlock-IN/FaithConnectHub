"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";
import { useEventListener } from "@/hooks/use-event-listner";
import { useIsTyping } from "@/hooks/use-store";
import { getSearchPlaceholder } from "@/lib/worship-collection";
import { cn, isMacOs } from "@/lib/utils";

import type { WorshipCatalog } from "@/lib/cached-worship-data";
import { WorshipCatalogProvider } from "@/context/worship-catalog-context";

import { FirebaseWorshipSearch } from "./firebase-worship-search";
import { WorshipTopItemsClient } from "./firebase-worship-top-items";

const TOP_ITEMS_LIMIT = 12;

export type SearchMenuProps = {
  className?: string;
  catalog: WorshipCatalog;
};

type SearchMenuTriggerProps = {
  className?: string;
  searchPlaceholder: string;
  shortcutKey: string;
  onOpen: () => void;
};

function SearchMenuTrigger({
  className,
  searchPlaceholder,
  shortcutKey,
  onOpen,
}: SearchMenuTriggerProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      type="button"
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={onOpen}
      className={cn(
        "flex h-9 w-full min-w-0 max-w-full justify-start gap-2 px-3 shadow-sm sm:h-10",
        className
      )}
    >
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate text-muted-foreground">{searchPlaceholder}</span>
      <kbd className="pointer-events-none ml-auto hidden h-6 shrink-0 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium md:inline-flex">
        <span className="text-xs">{shortcutKey}</span>K
      </kbd>
    </Button>
  );
}

export function SearchMenuClient({ catalog, className }: SearchMenuProps) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 500);

  const [_, setIsTyping] = useIsTyping();
  const { activeTab } = useEffectiveWorshipCollectionTab();

  const searchPlaceholder = getSearchPlaceholder(activeTab);
  const shortcutKey = mounted && isMacOs() ? "⌘" : "Ctrl";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pendingOpen) {
      setIsOpen(true);
      setPendingOpen(false);
    }
  }, [mounted, pendingOpen]);

  function openSearch() {
    if (!mounted) {
      setPendingOpen(true);
      return;
    }
    setIsOpen(true);
  }

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isOpen) {
        setIsOpen(false);
      } else {
        openSearch();
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
      setQuery("");
    }
  }, [isOpen, setIsTyping]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    setIsTyping(debouncedQuery.length > 0);
  }, [debouncedQuery, setIsTyping]);

  return (
    <>
      <SearchMenuTrigger
        className={className}
        searchPlaceholder={searchPlaceholder}
        shortcutKey={shortcutKey}
        onOpen={openSearch}
      />

      {mounted ?
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl shadow-md sm:w-full">
            <div className="relative mr-4 mt-4">
              <Search className="absolute left-2 top-3 size-4 text-muted-foreground" />

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8"
                autoFocus
              />
            </div>

            <WorshipCatalogProvider catalog={catalog}>
              {debouncedQuery.length ?
                <FirebaseWorshipSearch query={debouncedQuery} />
              : <WorshipTopItemsClient
                  songs={catalog.songs.slice(0, TOP_ITEMS_LIMIT)}
                  sermons={catalog.sermons.slice(0, TOP_ITEMS_LIMIT)}
                  articles={catalog.articles.slice(0, TOP_ITEMS_LIMIT)}
                />
              }
            </WorshipCatalogProvider>
          </DialogContent>
        </Dialog>
      : null}
    </>
  );
}
