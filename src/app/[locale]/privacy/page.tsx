import { SITE_NAME } from '@/lib/constants';

export const metadata = {
  title: `개인정보처리방침 | ${SITE_NAME}`,
  description: `${SITE_NAME} 개인정보처리방침`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-gray-700">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">개인정보처리방침</h1>
      <p className="mb-8 text-xs text-gray-400">최종 수정일: 2026년 9월 13일</p>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">선택적 사용성 지표</h2>
        <p>
          대시보드에서 동의한 경우에만 웹의 영상 추가·메모 저장·장면 이동 기능 도달 여부를
          Firebase에 저장합니다. 계정 UID를 해시한 식별자로 중복 집계하며, 지표에는 메모 내용·영상
          식별자·제목·이메일을 저장하지 않습니다. 이벤트 검증에는 해당 영상·메모 식별자를 일시적으로
          사용합니다. 지표는 수집 중단 시까지 보관하고 관리자에게 집계값으로 표시합니다. 대시보드의
          ‘수집 중단 및 계정 지표 삭제’를 누르면 단계 기록이 삭제되고, 재동의 전 이벤트를 거부하기
          위한 해시 식별자와 비동의 상태만 남습니다. 시작 안내 진행 상태와 이 브라우저의 수집 동의
          설정은 계정별 브라우저 로컬 저장소에 보관됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">1. 수집하는 정보</h2>
        <p className="mb-2">
          {SITE_NAME}(이하 &quot;서비스&quot;)는 Google 로그인을 통해 다음 정보를 수집합니다.
        </p>
        <ul className="ml-2 list-inside list-disc space-y-1">
          <li>Google 계정 이메일 주소</li>
          <li>Google 계정 표시 이름</li>
          <li>Google 계정 프로필 사진 URL</li>
          <li>서비스 내에서 사용자가 직접 입력한 메모 및 영상 정보</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">2. 정보 이용 목적</h2>
        <ul className="ml-2 list-inside list-disc space-y-1">
          <li>사용자 식별 및 로그인 처리</li>
          <li>타임스탬프 메모 저장 및 동기화</li>
          <li>웹 앱과 크롬 익스텐션 간 데이터 공유</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">3. 정보 보관 및 처리</h2>
        <p className="mb-2">
          수집된 데이터는 Google Firebase(Firestore)에 저장되며, Google의 보안 인프라에 의해
          보호됩니다. 서비스는 사용자 데이터를 제3자에게 판매하거나 광고 목적으로 사용하지 않습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">4. 제3자 서비스</h2>
        <p className="mb-2">서비스는 다음 제3자 서비스를 사용합니다.</p>
        <ul className="ml-2 list-inside list-disc space-y-1">
          <li>
            <strong>Google Firebase</strong> — 인증 및 데이터 저장 (
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              개인정보처리방침
            </a>
            )
          </li>
          <li>
            <strong>Google OAuth 2.0</strong> — 로그인 처리 (
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              개인정보처리방침
            </a>
            )
          </li>
          <li>
            <strong>YouTube</strong> — 영상 정보 표시 (YouTube Data API)
          </li>
          <li>
            <strong>Kakao AdFit</strong> — 광고 게재. Kakao는 쿠키를 사용하여 맞춤 광고를 제공할 수
            있습니다. (
            <a
              href="https://policy.kakao.com/ko/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              카카오 개인정보처리방침
            </a>
            )
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">5. 크롬 익스텐션 권한</h2>
        <p className="mb-2">크롬 익스텐션은 다음 권한을 사용합니다.</p>
        <ul className="ml-2 list-inside list-disc space-y-1">
          <li>
            <strong>identity</strong> — Google 계정 로그인
          </li>
          <li>
            <strong>storage</strong> — 로그인 상태 로컬 캐시
          </li>
          <li>
            <strong>sidePanel</strong> — 사이드 패널 메모 UI 표시
          </li>
          <li>
            <strong>tabs / activeTab</strong> — 현재 유튜브 탭 재생 시간 읽기
          </li>
          <li>
            <strong>host_permissions</strong> — 유튜브 페이지에 메모 UI 삽입, Firebase 통신
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">6. 데이터 삭제</h2>
        <p>
          계정 및 메모 데이터 삭제를 원하시면{' '}
          <a href="mailto:smw0807@gmail.com" className="text-red-600 hover:underline">
            smw0807@gmail.com
          </a>
          로 문의하시거나 서비스 내 삭제 기능을 이용하세요.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">7. 문의</h2>
        <p>
          개인정보 관련 문의:{' '}
          <a href="mailto:smw0807@gmail.com" className="text-red-600 hover:underline">
            smw0807@gmail.com
          </a>
        </p>
      </section>

      <hr className="mb-6 border-gray-200" />

      <h2 className="mb-3 text-base font-semibold text-gray-900">Privacy Policy (English)</h2>
      <p className="mb-4">
        Optional usage metrics require consent on the dashboard. We store feature milestones in
        Firebase under a hashed account UID, without memo content, video IDs, titles, or email.
        Video and memo IDs are used transiently to validate events. Metrics are retained until you
        stop collection and are shown to administrators as aggregate counts. The dashboard deletion
        button removes milestones; only the hashed identifier and disabled status remain to reject
        late events until renewed consent. Guide progress and this browser&apos;s consent setting
        are kept in per-account local storage.
      </p>
      <p className="mb-4">
        {SITE_NAME} collects your Google account email, display name, and profile photo for
        authentication, and stores notes you create in Google Firebase. We do not sell your data to
        third parties or use it for advertising. You may request deletion of your data by contacting{' '}
        <a href="mailto:smw0807@gmail.com" className="text-red-600 hover:underline">
          smw0807@gmail.com
        </a>
        .
      </p>
      <p className="mb-4">
        This site uses Kakao AdFit to display advertisements. Kakao may use cookies to serve
        personalized ads. For more information, see the{' '}
        <a
          href="https://policy.kakao.com/en/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:underline"
        >
          Kakao Privacy Policy
        </a>
        .
      </p>
    </main>
  );
}
