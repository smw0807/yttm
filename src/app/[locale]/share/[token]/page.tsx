import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getVideoByShareTokenAdmin, getMemosAdmin } from '@/lib/firebase/admin-firestore';
import { ShareViewerClient } from '@/components/player/ShareViewerClient';
import { SITE_SHORT_NAME } from '@/lib/constants';

interface Props {
  params: Promise<{ token: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token, locale } = await params;
  const video = await getVideoByShareTokenAdmin(token);
  if (!video) return {};

  const t = await getTranslations({ locale, namespace: 'shareViewer' });

  return {
    title: `${video.title} — ${SITE_SHORT_NAME}`,
    openGraph: {
      title: video.title,
      description: `${t('sharedTimeline')} ${video.title}`,
      images: [{ url: video.thumbnail, width: 1280, height: 720 }],
      type: 'video.other',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      images: [video.thumbnail],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const video = await getVideoByShareTokenAdmin(token);
  if (!video) notFound();

  const memos = await getMemosAdmin(video.id);

  return <ShareViewerClient video={video} memos={memos} />;
}
