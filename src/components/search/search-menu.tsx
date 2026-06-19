"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffectiveWorshipCollectionTab } from "@/hooks/use-effective-worship-collection-tab";
import { useEventListener } from "@/hooks/use-event-listner";
import { useIsTyping } from "@/hooks/use-store";
import { getSearchPlaceholder } from "@/lib/worship-collection";
import { cn, isMacOs } from "@/lib/utils";

import { FirebaseWorshipSearch } from "./firebase-worship-search";

type SearchMenuProps = {
  className?: string;
  topSearch: React.ReactNode;
};

export function SearchMenu({ topSearch, className }: SearchMenuProps) {
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 500);

  const [_, setIsTyping] = useIsTyping();
  const { activeTab } = useEffectiveWorshipCollectionTab();

  const searchPlaceholder = getSearchPlaceholder(activeTab);

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen((isOpen) => !isOpen);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "flex h-9 w-full min-w-0 max-w-full justify-start gap-2 px-3 shadow-sm sm:h-10",
            className
          )}
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate text-muted-foreground">{searchPlaceholder}</span>
          <kbd className="pointer-events-none ml-auto hidden h-6 shrink-0 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium md:inline-flex">
            <span className="text-xs">{isMacOs() ? "⌘" : "Ctrl"}</span>K
          </kbd>
        </Button>
      </DialogTrigger>

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

        {debouncedQuery.length ?
          <FirebaseWorshipSearch query={debouncedQuery} />
        : topSearch}
      </DialogContent>
    </Dialog>
  );
}
