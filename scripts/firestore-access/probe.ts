import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  limit,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';

export interface ProbeResult {
  label: string;
  passed: boolean;
  detail: string;
}

export function validateTargets(own: string, foreign: string) {
  const valid = /^[a-zA-Z0-9_-]{1,150}$/;
  if (!valid.test(own) || !valid.test(foreign) || own === foreign) {
    throw new Error('서로 다른 영상 문서 ID 두 개가 필요합니다. URL이 아닌 ID만 입력하세요.');
  }
}

export function errorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('code' in error)) return 'unknown';
  return typeof error.code === 'string' && /^[a-z/-]+$/.test(error.code) ? error.code : 'unknown';
}

export async function expectDenied(
  label: string,
  operation: () => Promise<unknown>,
): Promise<ProbeResult> {
  try {
    await operation();
    return { label, passed: false, detail: '접근이 허용됨 — 확인 필요' };
  } catch (error) {
    const code = errorCode(error);
    return { label, passed: code === 'permission-denied', detail: code };
  }
}

export async function runProbe(db: Firestore, uid: string, own: string, foreign: string) {
  validateTargets(own, foreign);
  // A missing or foreign "own" document must never count as a positive control.
  const ownVideo = await getDocFromServer(doc(db, 'videos', own));
  if (!ownVideo.exists() || ownVideo.data().userId !== uid) {
    throw new Error('본인 영상의 존재·소유권 확인 실패. 계정과 역할을 확인하세요.');
  }
  const results: ProbeResult[] = [
    { label: '본인 영상 존재·소유권', passed: true, detail: '서버 조회 성공' },
  ];
  const allowed = async (label: string, operation: () => Promise<unknown>) => {
    try {
      await operation();
      results.push({ label, passed: true, detail: '서버 조회 성공' });
    } catch (error) {
      results.push({ label, passed: false, detail: errorCode(error) });
    }
  };
  await allowed('본인 메모 목록', () =>
    getDocsFromServer(query(collection(db, 'videos', own, 'memos'), limit(5))),
  );
  for (const name of ['videos', 'collections']) {
    await allowed(`본인 ${name} 목록`, () =>
      getDocsFromServer(query(collection(db, name), where('userId', '==', uid), limit(5))),
    );
  }
  const denied: [string, () => Promise<unknown>][] = [
    ['타인 영상 직접 조회 차단', () => getDocFromServer(doc(db, 'videos', foreign))],
    [
      '타인 메모 목록 차단',
      () => getDocsFromServer(query(collection(db, 'videos', foreign, 'memos'), limit(1))),
    ],
    [
      '소유자 필터 없는 영상 목록 차단',
      () => getDocsFromServer(query(collection(db, 'videos'), limit(1))),
    ],
    [
      '소유자 필터 없는 컬렉션 목록 차단',
      () => getDocsFromServer(query(collection(db, 'collections'), limit(1))),
    ],
    ['서버 전용 지표 조회 차단', () => getDocFromServer(doc(db, '_onboardingMetrics', uid))],
  ];
  for (const [label, operation] of denied) results.push(await expectDenied(label, operation));
  return results;
}
