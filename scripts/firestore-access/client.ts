import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { errorCode, runProbe, validateTargets, type ProbeResult } from './probe';

declare const __FIREBASE_CONFIG__: FirebaseOptions;
if (
  !['localhost', '127.0.0.1'].includes(location.hostname) ||
  __FIREBASE_CONFIG__.projectId !== 'yttm-38af5'
) {
  throw new Error('Local production probe only');
}
const app = initializeApp(__FIREBASE_CONFIG__, 'read-only-access-probe');
const auth = getAuth(app);
const db = getFirestore(app);
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const login = element<HTMLButtonElement>('login');
const run = element<HTMLButtonElement>('run');
const logout = element<HTMLButtonElement>('logout');
const videoA = element<HTMLInputElement>('video-a');
const videoB = element<HTMLInputElement>('video-b');
const role = element<HTMLSelectElement>('role');
const status = element<HTMLElement>('status');
const output = element<HTMLElement>('results');
const account = element<HTMLElement>('account');
const reports = new Map<string, { uid: string; results: ProbeResult[] }>();
let busy = false;
function refresh() {
  login.disabled = busy;
  logout.disabled = busy || !auth.currentUser;
  run.disabled = busy || !auth.currentUser;
  videoA.disabled = videoB.disabled = role.disabled = busy;
  account.textContent = auth.currentUser
    ? `로그인: ${auth.currentUser.email ?? '이메일 없음'}`
    : '로그인 전';
}
function showResults() {
  output.textContent =
    [...reports]
      .map(
        ([key, report]) =>
          `계정 ${key.toUpperCase()}\n` +
          report.results
            .map((r) => `${r.passed ? 'PASS' : 'FAIL'} ${r.label}: ${r.detail}`)
            .join('\n'),
      )
      .join('\n\n') || '아직 실행하지 않았습니다.';
  const a = reports.get('a');
  const b = reports.get('b');
  if (a && b && a.uid !== b.uid && [...a.results, ...b.results].every((r) => r.passed)) {
    status.textContent = '전체 통과: 서로 다른 두 계정의 양방향 조회 검증 완료';
  }
}
for (const input of [videoA, videoB])
  input.addEventListener('input', () => {
    reports.clear();
    status.textContent = '대상 변경: 두 계정 모두 다시 검증해야 합니다.';
    showResults();
  });
login.addEventListener('click', () => {
  busy = true;
  refresh();
  status.textContent = 'Google 팝업에서 기존 계정을 선택하세요.';
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Call directly from the click handler: no async preflight that can block the popup.
  void signInWithPopup(auth, provider)
    .then(() => {
      status.textContent = '계정과 역할을 확인한 후 검증을 실행하세요.';
    })
    .catch((error) => {
      status.textContent = `로그인 실패: ${errorCode(error)}`;
    })
    .finally(() => {
      busy = false;
      refresh();
    });
});
logout.addEventListener('click', () => {
  busy = true;
  refresh();
  void signOut(auth)
    .then(() => {
      status.textContent = '검증 탭의 로그인만 해제했습니다.';
    })
    .catch((error) => {
      status.textContent = `로그아웃 실패: ${errorCode(error)}`;
    })
    .finally(() => {
      busy = false;
      refresh();
    });
});
run.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || busy) return;
  const key = role.value;
  reports.delete(key);
  busy = true;
  refresh();
  status.textContent = '서버에서 읽기 전용 검증 중…';
  showResults();
  try {
    const a = videoA.value.trim();
    const b = videoB.value.trim();
    validateTargets(a, b);
    const results = await runProbe(db, user.uid, key === 'a' ? a : b, key === 'a' ? b : a);
    reports.set(key, { uid: user.uid, results });
    status.textContent = results.every((r) => r.passed)
      ? '현재 계정 통과. 다른 역할의 계정도 검증해야 전체 완료입니다.'
      : '실패 항목을 확인하세요. 네트워크 오류는 접근 차단 통과로 계산하지 않습니다.';
  } catch (error) {
    status.textContent =
      errorCode(error) === 'unknown'
        ? '대상 ID 또는 본인 영상 존재·소유권 확인 실패. 입력과 계정 역할을 확인하세요.'
        : `검증 중단: ${errorCode(error)}`;
  } finally {
    busy = false;
    refresh();
    showResults();
  }
});
void setPersistence(auth, inMemoryPersistence)
  .then(() => {
    status.textContent = '준비 완료. 두 계정의 영상 ID를 입력하고 로그인하세요.';
    refresh();
  })
  .catch(() => {
    status.textContent = '메모리 전용 인증 초기화 실패. 검증을 중단합니다.';
  });
