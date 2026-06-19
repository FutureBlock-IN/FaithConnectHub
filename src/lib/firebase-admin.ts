import { readFileSync } from "fs";
import { resolve } from "path";

import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { FIREBASE_PROJECT_ID } from "./firebase-config";
import { resolveAdminStorageBucket } from "./firebase-storage-config";
import { storageLog } from "./firebase-storage-logger";

type ServiceAccountJson = Record<string, string> & {
  storage_bucket?: string;
};

function loadServiceAccountFromFile(): ServiceAccountJson | null {
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!filePath) return null;

  try {
    const absolutePath = resolve(process.cwd(), filePath);
    const raw = readFileSync(absolutePath, "utf8");
    return JSON.parse(raw) as ServiceAccountJson;
  } catch (error) {
    storageLog.error("Failed to read FIREBASE_SERVICE_ACCOUNT_PATH", error, {
      path: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    });
    return null;
  }
}

function loadServiceAccountFromEnv(): ServiceAccountJson | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ServiceAccountJson;
  } catch (error) {
    storageLog.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON", error);
    return null;
  }
}

function parseServiceAccount(): ServiceAccountJson | null {
  const parsed =
    loadServiceAccountFromFile() ?? loadServiceAccountFromEnv();

  if (!parsed) return null;

  if (
    parsed.type !== "service_account" ||
    !parsed.private_key ||
    !parsed.client_email
  ) {
    storageLog.error(
      "Service account JSON is incomplete",
      new Error("Invalid service account shape"),
      {
        hasPrivateKey: Boolean(parsed.private_key),
        hasClientEmail: Boolean(parsed.client_email),
      }
    );
    return null;
  }

  const serviceAccountProjectId = parsed.project_id?.trim();
  if (serviceAccountProjectId && serviceAccountProjectId !== FIREBASE_PROJECT_ID) {
    if (!loggedProjectMismatch) {
      loggedProjectMismatch = true;
      storageLog.warn(
        "Ignoring service account: project_id does not match app Firebase project. Download a new key for faithconnecthub-a4e6b or remove FIREBASE_SERVICE_ACCOUNT_PATH from .env.",
        {
          serviceAccountProjectId,
          appProjectId: FIREBASE_PROJECT_ID,
        }
      );
    }
    return null;
  }

  return parsed;
}

let adminApp: App | null = null;
let resolvedBucket: string | null = null;
let loggedProjectMismatch = false;

export function isAdminConfigured(): boolean {
  return parseServiceAccount() !== null;
}

export function getAdminStorageBucketName(): string | null {
  if (resolvedBucket) return resolvedBucket;
  const sa = parseServiceAccount();
  if (!sa) return null;
  resolvedBucket = resolveAdminStorageBucket(sa.storage_bucket);
  return resolvedBucket;
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) return null;

  const bucket = resolveAdminStorageBucket(serviceAccount.storage_bucket);
  resolvedBucket = bucket;

  storageLog.config("Initializing Firebase Admin", {
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: bucket,
    clientEmail: serviceAccount.client_email,
    storageBucketFromServiceAccount: serviceAccount.storage_bucket ?? null,
  });

  adminApp = initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: bucket,
  });

  return adminApp;
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminBucket() {
  const app = getAdminApp();
  const bucketName = getAdminStorageBucketName();
  if (!app || !bucketName) return null;
  return getStorage(app).bucket(bucketName);
}
