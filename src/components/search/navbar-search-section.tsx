import { SearchMenuClient } from "./search-menu-client";

type NavbarSearchSectionProps = {
  className?: string;
  placeholder?: string;
  enableShortcut?: boolean;
  churchId: string;
};

export function NavbarSearchSection({
  className,
  placeholder,
  enableShortcut,
  churchId,
}: NavbarSearchSectionProps) {
  return (
    <SearchMenuClient
      className={className}
      churchId={churchId}
      placeholder={placeholder}
      enableShortcut={enableShortcut}
    />
  );
}
