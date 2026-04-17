export const metadata = {
  title: '개인정보처리방침 | YouTube Timeline Memo',
  description: 'YouTube Timeline Memo 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">최종 수정일: 2026년 4월 17일</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">1. 수집하는 정보</h2>
        <p className="mb-2">YouTube Timeline Memo(이하 "서비스")는 Google 로그인을 통해 다음 정보를 수집합니다.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Google 계정 이메일 주소</li>
          <li>Google 계정 표시 이름</li>
          <li>Google 계정 프로필 사진 URL</li>
          <li>서비스 내에서 사용자가 직접 입력한 메모 및 영상 정보</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">2. 정보 이용 목적</h2>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>사용자 식별 및 로그인 처리</li>
          <li>타임스탬프 메모 저장 및 동기화</li>
          <li>웹 앱과 크롬 익스텐션 간 데이터 공유</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">3. 정보 보관 및 처리</h2>
        <p className="mb-2">
          수집된 데이터는 Google Firebase(Firestore)에 저장되며, Google의 보안 인프라에 의해 보호됩니다.
          서비스는 사용자 데이터를 제3자에게 판매하거나 광고 목적으로 사용하지 않습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">4. 제3자 서비스</h2>
        <p className="mb-2">서비스는 다음 제3자 서비스를 사용합니다.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Google Firebase</strong> — 인증 및 데이터 저장
            (<a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">개인정보처리방침</a>)
          </li>
          <li>
            <strong>Google OAuth 2.0</strong> — 로그인 처리
            (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">개인정보처리방침</a>)
          </li>
          <li>
            <strong>YouTube</strong> — 영상 정보 표시 (YouTube Data API)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">5. 크롬 익스텐션 권한</h2>
        <p className="mb-2">크롬 익스텐션은 다음 권한을 사용합니다.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>identity</strong> — Google 계정 로그인</li>
          <li><strong>storage</strong> — 로그인 상태 로컬 캐시</li>
          <li><strong>sidePanel</strong> — 사이드 패널 메모 UI 표시</li>
          <li><strong>tabs / activeTab</strong> — 현재 유튜브 탭 재생 시간 읽기</li>
          <li><strong>host_permissions</strong> — 유튜브 페이지에 메모 UI 삽입, Firebase 통신</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">6. 데이터 삭제</h2>
        <p>
          계정 및 메모 데이터 삭제를 원하시면{' '}
          <a href="mailto:contact@yttm.kr" className="text-red-600 hover:underline">
            contact@yttm.kr
          </a>
          로 문의하시거나 서비스 내 삭제 기능을 이용하세요.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">7. 문의</h2>
        <p>
          개인정보 관련 문의:{' '}
          <a href="mailto:contact@yttm.kr" className="text-red-600 hover:underline">
            contact@yttm.kr
          </a>
        </p>
      </section>

      <hr className="border-gray-200 mb-6" />

      <h2 className="text-base font-semibold text-gray-900 mb-3">Privacy Policy (English)</h2>
      <p className="mb-4">
        YouTube Timeline Memo collects your Google account email, display name, and profile photo for authentication,
        and stores notes you create in Google Firebase. We do not sell your data to third parties or use it for advertising.
        You may request deletion of your data by contacting{' '}
        <a href="mailto:contact@yttm.kr" className="text-red-600 hover:underline">contact@yttm.kr</a>.
      </p>
    </main>
  );
}
