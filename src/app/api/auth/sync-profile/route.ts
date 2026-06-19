import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

import { getAdminApp, getAdminDb } from "@/lib/firebase-admin";

type SyncProfileBody = {
  firstName?: string;
  lastName?: string;
};

export async function POST(request: Request) {
  const adminApp = getAdminApp();
  const adminDb = getAdminDb();

  if (!adminApp || !adminDb) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on the server." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.slice("Bearer ".length);

  let uid: string;
  let email: string | undefined;
  let displayName: string | undefined;

  try {
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    uid = decoded.uid;
    email = decoded.email;
    displayName = decoded.name;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: SyncProfileBody = {};
  try {
    body = (await request.json()) as SyncProfileBody;
  } catch {
    body = {};
  }

  const userRef = adminDb.collection("users").doc(uid);
  const existing = await userRef.get();

  if (!existing.exists) {
    const nameParts = (displayName ?? "").split(" ");
    const firstName = body.firstName?.trim() || nameParts[0] || "";
    const lastName =
      body.lastName?.trim() || nameParts.slice(1).join(" ") || "";

    const profile = {
      firstName,
      lastName,
      email: email ?? "",
      role: "user" as const,
      createdAt: FieldValue.serverTimestamp(),
    };

    await userRef.set(profile);

    return NextResponse.json({
      firstName,
      lastName,
      email: email ?? "",
      role: "user",
      createdAt: null,
    });
  }

  const data = existing.data()!;
  return NextResponse.json({
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    role: data.role ?? "user",
    createdAt: data.createdAt ?? null,
  });
}
