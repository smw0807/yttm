import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { SITE_NAME, SITE_SHORT_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `서비스 소개 | ${SITE_SHORT_NAME}`,
  description: `${SITE_NAME}은 유튜브 강의·게임 공략 영상의 중요한 장면에 타임스탬프 메모를 남기고, 클릭 한 번으로 해당 시점으로 바로 이동할 수 있는 생산성 도구입니다.`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-gray-700">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">서비스 소개</h1>
      <p className="mb-8 text-xs text-gray-400">YouTube Timeline Memo (YTTM)</p>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">1. 서비스란?</h2>
        <p className="mb-2">
          <strong>{SITE_NAME}</strong>은 유튜브 영상의 특정 시점에 메모를 남기고, 나중에 클릭
          한 번으로 해당 장면으로 바로 이동할 수 있는 타임스탬프 메모 서비스입니다.
        </p>
        <p>
          강의 영상에서 핵심 내용을 정리하거나, 게임 공략 영상에서 중요한 전략을 기록하거나,
          영화·강연에서 인상적인 장면을 저장해 두고 싶을 때 유용하게 활용할 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">2. 개발 동기</h2>
        <p className="mb-2">
          유튜브로 프로그래밍 강의나 게임 공략 영상을 보다 보면 &quot;이 부분 나중에 다시
          봐야지&quot; 싶은 순간이 자주 생깁니다. 그런데 YouTube 재생목록이나 북마크로는 영상
          전체를 저장할 수는 있어도, <em>특정 시점</em>을 바로 기록하고 메모를 붙이는 방법이
          없었습니다.
        </p>
        <p>
          이 불편함을 해소하기 위해 타임스탬프 단위로 메모를 저장하고, 클릭 한 번으로 해당
          장면으로 이동하는 도구를 직접 만들었습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">3. 주요 기능</h2>
        <ul className="ml-2 list-inside list-disc space-y-2">
          <li>
            <strong>타임스탬프 메모</strong> — 영상 재생 중 현재 시점에 메모를 남기고, 메모
            클릭 시 해당 시간으로 즉시 이동
          </li>
          <li>
            <strong>컬렉션</strong> — 관련 영상을 주제별로 묶어 관리 (예: &quot;파이썬 강의&quot;,
            &quot;롤 정글 공략&quot;)
          </li>
          <li>
            <strong>공유 링크</strong> — 내 메모 타임라인을 링크 하나로 다른 사람과 공유
          </li>
          <li>
            <strong>크롬 확장프로그램</strong> — YouTube 페이지를 떠나지 않고 사이드 패널에서
            바로 메모 작성·조회
          </li>
          <li>
            <strong>게스트 모드</strong> — 회원가입 없이 즉시 체험 가능
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">4. 이런 분께 추천합니다</h2>
        <ul className="ml-2 list-inside list-disc space-y-1">
          <li>유튜브로 공부하면서 강의 내용을 정리하고 싶은 학생·직장인</li>
          <li>게임 공략 영상을 보며 전략을 메모해 두고 싶은 게이머</li>
          <li>강연·다큐멘터리에서 인상적인 구간을 저장해 두고 싶은 분</li>
          <li>팀원에게 유튜브 특정 구간을 공유해야 하는 분</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">5. 연락처</h2>
        <p>
          서비스 관련 문의나 피드백은 아래 이메일로 보내주세요.
          <br />
          <a href="mailto:smw0807@gmail.com" className="text-red-600 hover:underline">
            smw0807@gmail.com
          </a>
        </p>
      </section>

      <hr className="mb-6 border-gray-200" />

      <h2 className="mb-3 text-base font-semibold text-gray-900">About (English)</h2>
      <p className="mb-3">
        <strong>{SITE_NAME}</strong> is a productivity tool that lets you leave timestamp memos on
        key moments in YouTube videos. Click any memo to jump instantly to that point in the video.
      </p>
      <p className="mb-3">
        It&apos;s built for learners who study with YouTube lectures, gamers who reference strategy
        videos, and anyone who wants to save and revisit specific moments in long-form video content.
      </p>
      <p className="mb-3">
        Key features: timestamp memos, topic-based collections, shareable timeline links, and a
        Chrome extension for in-page note-taking without leaving YouTube.
      </p>
      <p>
        Contact:{' '}
        <a href="mailto:smw0807@gmail.com" className="text-red-600 hover:underline">
          smw0807@gmail.com
        </a>
      </p>

      <div className="mt-10">
        <Link href="/" className="text-red-600 hover:underline text-xs">
          ← 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
