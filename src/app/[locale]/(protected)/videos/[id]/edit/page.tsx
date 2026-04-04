import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideoAdmin, getMemosAdmin } from '@/lib/firebase/admin-firestore';
import { MemoEditContent } from '@/components/player/MemoEditContent';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoAdmin(id);
  if (!video) return {};
  return { title: `메모 편집 — ${video.title}` };
}

export default async function MemoEditPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  const video = await getVideoAdmin(id);

  if (!video || video.userId !== user!.uid) notFound();

  const memos = await getMemosAdmin(id);

  return <MemoEditContent video={video} memos={memos} />;
}
