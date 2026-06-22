"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useEventListener } from "@/hooks/use-event-listner";
import { useIsTyping } from "@/hooks/use-store";
import { getGlobalSearchPlaceholder } from "@/lib/worship-collection";
import { cn, isMacOs } from "@/lib/utils";

import type { WorshipCatalog } from "@/lib/cached-worship-data";
import { WorshipCatalogProvider } from "@/context/worship-catalog-context";

import { GlobalSearchResults } from "./global-search-results";
import { WorshipTopItemsClient } from "./firebase-worship-top-items";

const TOP_ITEMS_LIMIT = 12;

export type SearchMenuProps = {
  className?: string;
  catalog: WorshipCatalog;
  placeholder?: string;
  enableShortcut?: boolean;
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

export function SearchMenuClient({
  catalog,
  className,
  placeholder,
  enableShortcut = true,
}: SearchMenuProps) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 500);

  const [_, setIsTyping] = useIsTyping();

  const searchPlaceholder = placeholder ?? getGlobalSearchPlaceholder();
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
    if (!enableShortcut) return;
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
      setIsTyping(debouncedQuery.length > 0);
      return;
    }

    setIsTyping(false);
    setQuery("");
  }, [debouncedQuery, isOpen, setIsTyping]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
          <DialogContent
            className={cn(
              "flex max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden p-0 shadow-md",
              "fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 rounded-none border-0",
              "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:p-6",
            )}
          >
            <div className="relative shrink-0 border-b border-border/40 px-4 pb-3 pt-4 sm:mr-4 sm:mt-4 sm:border-0 sm:p-0">
              <Search className="absolute left-6 top-7 size-4 text-muted-foreground sm:left-2 sm:top-3" />

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8"
                autoFocus
              />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-4 sm:px-0">
              <WorshipCatalogProvider catalog={catalog}>
                {debouncedQuery.length ?
                  <GlobalSearchResults query={debouncedQuery} />
                : <WorshipTopItemsClient
                    songs={catalog.songs.slice(0, TOP_ITEMS_LIMIT)}
                    sermons={catalog.sermons.slice(0, TOP_ITEMS_LIMIT)}
                    articles={catalog.articles.slice(0, TOP_ITEMS_LIMIT)}
                  />
                }
              </WorshipCatalogProvider>
            </div>
          </DialogContent>
        </Dialog>
      : null}
    </>
  );
}
