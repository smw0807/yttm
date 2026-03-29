import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getVideoByShareTokenAdmin, getMemosAdmin } from '@/lib/firebase/admin-firestore';
import { ShareViewerClient } from '@/components/player/ShareViewerClient';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const video = await getVideoByShareTokenAdmin(token);
  if (!video) return {};

  return {
    title: `${video.title} — YT Timeline Memo`,
    openGraph: {
      title: video.title,
      description: `타임라인 메모가 ${video.title} 영상에 첨부되어 있습니다.`,
      images: [{ url: video.thumbnail, width: 1280, height: 720 }],
      type: 'video.other',
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
