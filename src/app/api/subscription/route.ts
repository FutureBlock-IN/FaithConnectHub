import { NextResponse } from "next/server";

import { resolveIsAdmin } from "@/lib/admin-access";
import { canManageChurch } from "@/lib/church-access";
import { getAdminDb } from "@/lib/firebase-admin";
import { resolveChurchIdForWrite } from "@/lib/church-scope";
import {
  ensureSubscriptionDocument,
  getSubscriptionSnapshot,
} from "@/lib/subscription/subscription-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const churchId = resolveChurchIdForWrite(
    searchParams.get("churchId")
  );

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ?
    authHeader.slice(7)
  : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    const snapshot = await getSubscriptionSnapshot(churchId);
    return NextResponse.json(snapshot);
  }

  try {
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();
    const userData = userSnap.exists ? userSnap.data() : null;

    const isAdmin =
      resolveIsAdmin(decoded.email) || userData?.role === "admin";
    const canManage = canManageChurch(
      {
        email: decoded.email,
        churchId: userData?.churchId as string | undefined,
        churchRole: userData?.churchRole as "member" | "admin" | undefined,
        managedChurchIds: userData?.managedChurchIds as string[] | undefined,
      },
      churchId
    );
    const isMemberOfChurch =
      String(userData?.churchId ?? "").trim() === churchId;

    if (!isAdmin && !canManage && !isMemberOfChurch) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ensureSubscriptionDocument(churchId);
    const snapshot = await getSubscriptionSnapshot(churchId);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[api/subscription]", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
