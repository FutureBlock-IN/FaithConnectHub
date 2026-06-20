"use server";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";

import type {
  CreateArticleInput,
  FirebaseArticle,
  UpdateArticleInput,
} from "@/types/firebase-article";

import { getAdminDb } from "./firebase-admin";
import { db } from "./firebase";
import { filterRecordsByChurch } from "./church-scope";
import {
  isRecoverableAdminError,
  wrapFirebaseError,
} from "./firebase-utils";
import {
  ARTICLES_COLLECTION,
  normalizeArticleFromFirestore,
} from "./article-firestore";

function normalizeArticle(
  id: string,
  data: Record<string, unknown>
): FirebaseArticle {
  return normalizeArticleFromFirestore(id, data);
}

async function fetchAllArticles(): Promise<FirebaseArticle[]> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(ARTICLES_COLLECTION)
        .orderBy("dateCreated", "desc")
        .get();

      return snapshot.docs.map((docSnap) =>
        normalizeArticle(docSnap.id, docSnap.data() as Record<string, unknown>)
      );
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      orderBy("dateCreated", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      normalizeArticle(docSnap.id, docSnap.data() as Record<string, unknown>)
    );
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, ARTICLES_COLLECTION));
      return snapshot.docs
        .map((docSnap) =>
          normalizeArticle(docSnap.id, docSnap.data() as Record<string, unknown>)
        )
        .sort((a, b) => b.dateCreated - a.dateCreated);
    } catch (innerError) {
      wrapFirebaseError(innerError);
    }
  }
}

export async function getArticles(churchId: string): Promise<FirebaseArticle[]> {
  return filterRecordsByChurch(await fetchAllArticles(), churchId);
}

export async function getPublishedArticles(
  churchId: string
): Promise<FirebaseArticle[]> {
  const articles = filterRecordsByChurch(await fetchAllArticles(), churchId);
  return articles.filter((a) => a.isPublished);
}

export async function getArticleById(
  articleId: string
): Promise<FirebaseArticle | null> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection(ARTICLES_COLLECTION)
        .doc(articleId)
        .get();

      if (!snapshot.exists) return null;

      return normalizeArticle(
        snapshot.id,
        snapshot.data() as Record<string, unknown>
      );
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const snapshot = await getDoc(doc(db, ARTICLES_COLLECTION, articleId));
    if (!snapshot.exists()) return null;

    return normalizeArticle(
      snapshot.id,
      snapshot.data() as Record<string, unknown>
    );
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function searchArticles(
  churchId: string,
  searchQuery: string
): Promise<FirebaseArticle[]> {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return [];

  const articles = await getPublishedArticles(churchId);
  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.category,
      article.author,
      article.scriptureReference ?? "",
      article.shortDescription,
      ...article.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export async function createArticle(
  articleData: CreateArticleInput
): Promise<string> {
  const adminDb = getAdminDb();
  const payload = {
    ...articleData,
    dateCreated: FieldValue.serverTimestamp(),
  };

  if (adminDb) {
    try {
      const docRef = await adminDb.collection(ARTICLES_COLLECTION).add(payload);
      return docRef.id;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...articleData,
      dateCreated: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function updateArticle(
  articleId: string,
  updates: UpdateArticleInput
): Promise<void> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      await adminDb.collection(ARTICLES_COLLECTION).doc(articleId).update(updates);
      return;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    await updateDoc(doc(db, ARTICLES_COLLECTION, articleId), updates);
  } catch (error) {
    wrapFirebaseError(error);
  }
}

export async function deleteArticle(articleId: string): Promise<void> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      await adminDb.collection(ARTICLES_COLLECTION).doc(articleId).delete();
      return;
    } catch (error) {
      if (!isRecoverableAdminError(error)) {
        wrapFirebaseError(error);
      }
      console.warn("[Firebase] Admin SDK unavailable, using client SDK:", error);
    }
  }

  try {
    await deleteDoc(doc(db, ARTICLES_COLLECTION, articleId));
  } catch (error) {
    wrapFirebaseError(error);
  }
}
