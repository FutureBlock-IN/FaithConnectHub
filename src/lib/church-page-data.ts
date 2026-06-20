import type { FirebaseChurch } from "@/types/firebase-church";

import { getChurchByIdCached } from "./cached-church-data";
import { resolveActiveChurchId } from "./church-server";

export async function getPageChurchContext(): Promise<{
  churchId: string;
  church: FirebaseChurch | null;
}> {
  const churchId = await resolveActiveChurchId();
  const church = await getChurchByIdCached(churchId);
  return { churchId, church };
}
