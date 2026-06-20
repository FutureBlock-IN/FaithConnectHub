/**
 * Multi-tenant church scoping utilities.
 * All content queries must filter through these helpers — never load all churches.
 */

/** Fallback for legacy documents created before multi-church rollout. */
export function getLegacyDefaultChurchId(): string {
  return (
    process.env.DEFAULT_CHURCH_ID?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_CHURCH_ID?.trim() ||
    ""
  );
}

export function resolveDocumentChurchId(
  data: Record<string, unknown>
): string {
  const explicit = String(data.churchId ?? "").trim();
  if (explicit) return explicit;
  return getLegacyDefaultChurchId();
}

export function documentBelongsToChurch(
  data: Record<string, unknown>,
  churchId: string
): boolean {
  if (!churchId.trim()) return false;
  const docChurchId = resolveDocumentChurchId(data);
  if (!docChurchId) return false;
  return docChurchId === churchId;
}

export function filterRecordsByChurch<T extends { churchId?: string }>(
  records: T[],
  churchId: string
): T[] {
  const legacyId = getLegacyDefaultChurchId();
  return records.filter((record) => {
    const recordChurchId = record.churchId?.trim() || legacyId;
    return recordChurchId === churchId;
  });
}

export function slugifyChurchSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidChurchSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
}
