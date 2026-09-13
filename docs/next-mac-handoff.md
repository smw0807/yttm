# YTTM 다음 Mac 작업 인계

작성 기준: 2026-09-13. 다른 Mac에서 이 파일을 먼저 읽고 아래 우선순위대로 이어간다.

## 1. 현재 상태

- 저장소: https://github.com/smw0807/yttm
- 작업 브랜치: `develop`
- 최신 앱 작업 커밋: `e19e2f7` — 메타데이터 상속과 다국어 공유 URL 수정. 이 문서 갱신은 후속 커밋에 포함하며, 새 Mac 검증 시작 시 원격 `develop`은 `6244b99`였다.
- 이전 커밋: `ac85a77` — 공유 실패 처리·컬렉션 모바일 접근성, `b07e073` — 구버전 확장 인증 API 보강
- 2026-09-13 새 Mac에서 Vercel 운영 배포 `6b51741` (`main`)의 Ready 상태와 `www.yttm.kr` 연결을 직접 확인했다. `a9e0688`을 포함하며 운영 커밋 및 `6244b99`의 원격 CI도 통과했다.
- 새 Mac에서 운영 공유·컬렉션 회귀 검증과 Chrome 로그인·로그아웃·관리자 조회를 완료했다. 메타데이터 경고·홈/공유 URL 보완은 `e19e2f7`으로 커밋했다. 사용자가 커밋·푸시를 요청하고 직접 배포하겠다고 알렸으며, 해당 변경의 운영 배포 완료는 아직 확인하지 않았다.
- 운영 주소: https://www.yttm.kr
- 이 문서는 인계용 문서 커밋에 포함한다. 다른 Mac에서는 `develop`을 최신으로 받은 뒤 `docs/next-mac-handoff.md`를 연다. 문서 커밋은 앱 코드 변경이나 운영 재배포를 의미하지 않는다.
- 상세 이력: [운영 검증 기록](production-validation.md), 개발 안내: [README](../README.md), [CLAUDE.md](../CLAUDE.md)
- 상세 이력의 “아직 커밋하지 않았다 / 배포 보류” 문구는 당시 시점의 기록이다. 현재 인계 상태는 이 절과 실제 Git·배포 상태를 기준으로 판단한다.

## 2. 남은 작업 — 우선순위 순

### 1순위: 이번 배포 운영 검증

- [x] 배포 대시보드에서 실제 배포 커밋과 빌드 성공 여부 확인. `6b51741`이 `a9e0688`을 포함하고 운영 도메인에 연결돼 있다.
- [x] Google 로그인·로그아웃·재로그인, 대시보드·영상 조회 확인.
- [ ] 관리자 계정의 `/admin` 접근과 비관리자 계정의 접근 거부 확인. 거부 확인 버튼은 이전 화면으로 돌아가야 한다.
- [x] 공유 생성 → 비로그인 열람 → 실제 OS 복사·붙여넣기 → 폐기 후 새 요청 404 차단 확인.
- [x] 컬렉션 생성·영상 추가/제거·새로고침 유지·삭제 및 삭제 후 원본 영상·메모 보존 확인. 승인받아 이번 테스트 데이터도 정리했다.
- [x] 최근 하루 운영 로그의 Warning/Error/Fatal 0건 확인. 원문 요청·자격증명은 기록하지 않는다.
- [x] 검증 일시, 배포 커밋, 브라우저, 성공/실패, 남은 제한을 `production-validation.md`에 추가했다.

완료 기준: 테스트한 범위와 실패 유무가 증거와 함께 기록돼야 한다. 운영 데이터를 생성·변경·삭제하는 테스트는 사용할 계정과 테스트 데이터·정리 범위를 먼저 사용자와 합의한다. 기존 사용자 자료를 테스트 정리 대상으로 삼지 않는다.

### 2순위: 운영 환경변수 정리 — 적용 승인 필요

2026-09-13 새 Mac에서 현재 Vercel 등록 유형·범위를 다시 확인했다. 아래 변경은 적용하지 않았다.

- [ ] `FIREBASE_ADMIN_SDK`, `YOUTUBE_API_KEY`: 기존 값·적용 범위를 유지한 Config → Secret 전환 승인 받기.
- [ ] 미사용 `ADMIN_UIDS`: 현재 소스 및 Preview·이전 버전 재빌드/롤백의 의존성 확인 후 삭제 승인 받기.
- [x] `ADMIN_UID` Secret / Production 유지 확인. 관리자 권한은 서버 세션 Firebase UID와 이 값 하나의 일치 여부로 판단한다.
- [ ] 승인 후 적용 결과 확인 및 필요한 다음 배포·로그인·YouTube 조회·관리자 접근 재검증 계획 수립.

주의: Secret 전환은 키 교체가 아니다. 원본 비밀값의 안전한 보관을 확인하고, 재입력이나 범위 변경을 요구하면 사용자에게 확인한다. 비밀값을 채팅·Git·문서에 넣지 않는다. 환경별 자격증명 분리·키 교체는 별도 범위다. 광고 설정은 현 상태를 유지하며 활성화는 별도 결정한다.

### 3순위: 실제 Safari·모바일 기기 검증

- [ ] macOS Safari 앱에서 Google 로그인, 공유 링크 복사·붙여넣기, YouTube 재생·메모 시점 이동 확인.
- [x] macOS 26.4 / Safari 26.4에서 공개 데모 공유 페이지 열람·YouTube 재생·1:27 메모 시점 이동 확인. OAuth 및 Safari 복사는 별도 검증이다.
- [ ] 실제 iPhone 등 모바일 기기에서 같은 흐름과 컬렉션 터치 조작 확인.
- [ ] 클립보드 거부 시 오류 안내·링크 직접 선택·재시도 확인 가능한 범위 기록.
- [ ] 기기·OS·브라우저 버전과 실제 검증 결과 기록.

완료 기준: WebKit 에뮬레이션과 실제 Safari/기기 결과를 구분한다. 실제 클립보드 테스트 전 기존 내용 덮어쓰기를 사용자에게 알리고, 비밀번호·추가 인증은 사용자가 직접 입력한다. 이전 Mac의 Chrome 프로필·로그인 상태·확장 설치·localhost 검증 탭은 새 Mac에 자동으로 이어지지 않는다.

### 4순위: 구버전 확장 인증 API 운영 점검

- [ ] `/api/auth/extension-token`의 실제 사용량, 오류율, 429/503 발생 여부 확인.
- [x] 2026-09-12 22:08~09-13 22:08 KST 로그 검색에서 해당 경로 요청이 없음을 확인. 전체 보관 기간의 미사용이나 실제 구버전 로그인 성공을 의미하지 않는다.
- [ ] 배포된 구버전 확장이 여전히 이 API를 사용하는지 확인하고 가능한 범위에서 호환성 검증.
- [ ] 실제 사용 여부·관찰 기간을 근거로 유지/폐기와 제한값 조정 필요성 결정. 사용처가 소스에 없다는 이유만으로 삭제하지 않는다.

현재 최신 확장은 `extension/src/lib/auth.ts`에서 Firebase 직접 로그인을 사용한다. 호환 API에는 전체 120회/60초, UID별 10회/60초 제한과 입력 검증·10초 upstream 제한이 추가돼 있다. 운영 부하 발생이나 제한값 변경은 이번 읽기 점검과 별도로 합의한다.

### 5순위: metadataBase 빌드 경고 및 공유 미리보기

- [x] `yarn build:ci` 경고 재현 및 원인 확인: 루트 OG 이미지가 `[locale]`의 `metadataBase`보다 상위 범위에서 처리됐다.
- [x] 이미지 파일을 `[locale]`로 이동하고 홈의 Open Graph 이미지 상속을 보완했다. `metadataBase` 중복 추가는 하지 않았다.
- [x] 한국어·영어 홈의 canonical/Open Graph/Twitter URL과 1200×630 PNG 응답을 로컬 빌드에서 검증했다. 공유 페이지 canonical/OG URL과 영상 썸네일 유지도 단위 테스트로 확인했다.
- [x] 수정 후 단위 테스트 208개, 웹·확장 타입 검사와 경고 없는 빌드 통과.
- [ ] `e19e2f7`을 포함한 다음 운영 배포 후 URL/공유 미리보기 재확인. 배포는 사용자가 진행하며 실제 소셜 서비스의 캐시 갱신은 미검증이다.

## 3. 이미 수행한 검증과 한계

아래는 직전 Mac의 기록이다. 새 Mac에서 재실행한 결과는 아니다.

- 단위 테스트 205개 통과.
- Chrome PC/모바일 크기 24개, WebKit PC/iPhone 13 크기 24개 E2E 통과.
- 웹·확장 타입 검사, 변경 코드 ESLint, 포맷·diff 검사, `yarn build:ci` 통과. `metadataBase` 경고는 남아 있다.
- 기본 E2E는 Auth/Firestore 에뮬레이터와 가짜 YouTube 응답을 사용한다. 운영 Firebase 쓰기나 실제 OAuth·YouTube 재생 검증이 아니다.
- 클립보드 테스트는 거부/미지원/성공 응답을 모킹한다. 실제 OS 클립보드를 읽거나 쓰지 않았다.
- 이전 두 계정의 운영 Firestore 읽기 권한 검증은 18개 항목 통과 기록이 있다. 전체 운영 권한·쓰기 검증 완료를 의미하지 않는다.
- WebKit 테스트는 수동 실행 모드이며 기본 CI에는 추가하지 않았다. 이번 푸시의 원격 CI 결과는 별도 확인해야 한다.

## 4. 다른 Mac 시작 순서

1. 이 문서를 전달받고 저장소를 연다. 기존 체크아웃에 변경이 있다면 먼저 보존한다.
2. 신규 체크아웃이라면 아래처럼 준비한다. 기존 체크아웃은 `git status` 확인 후 `develop`에서 `git pull --ff-only origin develop`을 사용한다. 강제 초기화하지 않는다.

```bash
git clone --branch develop https://github.com/smw0807/yttm.git
cd yttm
git status --short
git log -3 --oneline
```

3. 저장소의 CI 기준인 Node 22(22.12 이상), Yarn 1.22.22, Java 21과 Google Chrome을 준비한다. 의존성은 두 lockfile을 유지한다.

```bash
yarn install --frozen-lockfile
yarn --cwd extension install --frozen-lockfile
yarn playwright install webkit
yarn typecheck
yarn test
```

4. 브라우저 검증은 아래 명령을 **순서대로** 실행한다. 포트가 비어 있어야 하며 다른 작업의 서버를 임의 종료하지 않는다.

```bash
E2E_PORT=3102 yarn test:e2e
E2E_PORT=3102 yarn test:e2e:webkit
yarn build:ci
git diff --check
```

- macOS 기본 E2E는 설치된 Chrome을 사용한다. Chrome이 없다면 `yarn playwright install chromium` 후 `E2E_BROWSER_CHANNEL=chromium E2E_PORT=3102 yarn test:e2e`로 실행할 수 있다.
- E2E 프로젝트는 `demo-yttm-e2e`, Auth 포트는 9098, Firestore는 8086이다. `yarn test:emulator`는 별도 `demo-yttm-tests`와 8085를 사용한다. 운영 프로젝트로 바꾸지 않는다.
- 에뮬레이터 테스트·`build:ci`는 운영 비밀값을 필요로 하지 않는다. `build:ci`는 임시 자격증명으로 컴파일하며 **그 산출물을 배포하지 않는다**.
- 실제 로컬 앱 개발에 필요한 `.env.local`은 예제 파일을 참고해 안전한 경로로 별도 준비한다. 이전 Mac의 비밀 파일을 문서에 첨부하거나 Git에 추가하지 않는다.
- WebKit 보고서: `playwright-report/webkit`, 기본 보고서: `playwright-report/standard`. 보고서·trace는 Git 제외 대상이며 세션 정보가 포함될 수 있어 외부에 공개하지 않는다.
- 변경 파일의 ESLint·Prettier도 실행한다. 전체 린트 실패 시 기존 문제인지 현재 변경인지 구분하고, 경고나 오류를 무조건 무시하지 않는다.

## 5. 다음 작업자에게 전달할 요청

> `docs/next-mac-handoff.md`를 읽고 실제 Git·배포 상태를 확인한 뒤 1순위 운영 검증부터 진행해줘. 운영 쓰기 테스트는 계정과 데이터 범위를 먼저 확인하고, 환경변수 변경·키 교체·재배포는 별도 승인 없이 하지 마. 관리자 UID 기반 권한 검사를 유지하고 비밀번호·토큰을 출력하지 마. 작업 완료 시 검증 결과와 남은 우선순위를 문서와 답변에 정리해줘.
