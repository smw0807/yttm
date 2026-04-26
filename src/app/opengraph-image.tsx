import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/constants';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* 배경 액센트 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#ef4444',
          }}
        />

        {/* 서비스명 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-1px',
            marginBottom: '20px',
            display: 'flex',
          }}
        >
          {SITE_NAME}
        </div>

        {/* 태그라인 */}
        <div
          style={{
            fontSize: 30,
            color: '#6b7280',
            marginBottom: '56px',
            display: 'flex',
          }}
        >
          유튜브 강의 보다가 중요한 부분, 링크 하나로 바로 돌아가기
        </div>

        {/* 기능 뱃지 3개 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['타임스탬프 메모', '컬렉션 관리', '공유 링크'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '12px 24px',
                background: '#f3f4f6',
                borderRadius: '9999px',
                fontSize: '22px',
                color: '#374151',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
