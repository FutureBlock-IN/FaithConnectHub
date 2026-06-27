import { NextResponse } from "next/server";
import { z } from "zod";

import { triggerPrayerApprovedEmail } from "@/lib/email/triggers";
import { verifyBearerToken } from "@/lib/email/verify-auth";
import { resolveIsAdmin } from "@/lib/admin-access";
import { getAdminDb } from "@/lib/firebase-admin";

const bodySchema = z.object({
  prayerId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const authUser = await verifyBearerToken(request);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json({ success: true });
  }

  const userSnap = await adminDb.collection("users").doc(authUser.uid).get();
  const userData = userSnap.exists ? userSnap.data() : null;
  const isAdmin =
    resolveIsAdmin(authUser.email) || userData?.role === "admin";

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await triggerPrayerApprovedEmail(body.prayerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/email/prayer-approved]", error);
    return NextResponse.json({ success: true });
  }
}
