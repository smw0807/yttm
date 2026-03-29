import "server-only";

import { adminDb } from "./admin";
import type { Video, Memo, Collection } from "@/types";

/** Firestore Admin Timestamp → number(ms) 변환 (SC→CC 직렬화)
 *  instanceof 대신 duck typing: toMillis 메서드 존재 여부로 판별 */
function serialize<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => {
      if (v !== null && typeof v === "object" && typeof (v as { toMillis?: unknown }).toMillis === "function") {
        return [k, (v as { toMillis: () => number }).toMillis()];
      }
      return [k, v];
    })
  ) as T;
}

// ── Videos ────────────────────────────────────────────────────────────────────

export async function getVideosAdmin(userId: string) {
  const snap = await adminDb
    .collection("videos")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => serialize({ id: d.id, ...d.data() }) as Video & { id: string });
}

export async function getVideoAdmin(videoId: string) {
  const snap = await adminDb.collection("videos").doc(videoId).get();
  if (!snap.exists) return null;
  return serialize({ id: snap.id, ...snap.data() }) as Video & { id: string };
}

export async function getVideoByShareTokenAdmin(token: string) {
  const snap = await adminDb
    .collection("videos")
    .where("shareToken", "==", token)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const d = snap.docs[0];
  return serialize({ id: d.id, ...d.data() }) as Video & { id: string };
}

// ── Memos ─────────────────────────────────────────────────────────────────────

export async function getMemosAdmin(videoId: string) {
  const snap = await adminDb
    .collection("videos")
    .doc(videoId)
    .collection("memos")
    .orderBy("timestampSec", "asc")
    .get();

  return snap.docs.map((d) => serialize({ id: d.id, ...d.data() }) as Memo & { id: string });
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function getCollectionsAdmin(userId: string) {
  const snap = await adminDb
    .collection("collections")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => serialize({ id: d.id, ...d.data() }) as Collection & { id: string });
}
