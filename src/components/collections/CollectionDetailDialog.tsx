'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateCollection } from '@/lib/firebase/firestore';
import { formatTimestamp } from '@/lib/youtube';
import type { Collection, Video } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  collection: Collection & { id: string };
  allVideos: (Video & { id: string })[];
}

export function CollectionDetailDialog({ open, onClose, collection, allVideos }: Props) {
  const [videoIds, setVideoIds] = useState(collection.videoIds);
  const [loading, setLoading] = useState(false);

  const inCollection = allVideos.filter((v) => videoIds.includes(v.id));
  const notInCollection = allVideos.filter((v) => !videoIds.includes(v.id));

  async function toggle(videoId: string, add: boolean) {
    const newIds = add ? [...videoIds, videoId] : videoIds.filter((id) => id !== videoId);
    setVideoIds(newIds);
    setLoading(true);
    await updateCollection(collection.id, { videoIds: newIds });
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{collection.name}</DialogTitle>
          {collection.description && (
            <p className="text-muted-foreground text-sm">{collection.description}</p>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold">포함된 영상 ({inCollection.length}개)</h3>
            {inCollection.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                아직 영상이 없습니다. 아래에서 추가하세요.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {inCollection.map((video) => (
                  <VideoRow
                    key={video.id}
                    video={video}
                    href={`/videos/${video.id}`}
                    action="제거"
                    actionVariant="outline"
                    disabled={loading}
                    onAction={() => toggle(video.id, false)}
                  />
                ))}
              </ul>
            )}
          </section>

          {notInCollection.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold">
                추가 가능한 영상 ({notInCollection.length}개)
              </h3>
              <ul className="flex flex-col gap-2">
                {notInCollection.map((video) => (
                  <VideoRow
                    key={video.id}
                    video={video}
                    action="추가"
                    actionVariant="default"
                    disabled={loading}
                    onAction={() => toggle(video.id, true)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoRow({
  video,
  href,
  action,
  actionVariant,
  disabled,
  onAction,
}: {
  video: Video & { id: string };
  href?: string;
  action: string;
  actionVariant: 'default' | 'outline';
  disabled: boolean;
  onAction: () => void;
}) {
  const info = (
    <>
      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded">
        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" sizes="96px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
        <p className="text-muted-foreground text-xs">{formatTimestamp(video.durationSec)}</p>
      </div>
    </>
  );

  return (
    <li className="flex items-center gap-3 rounded-lg border p-2">
      {href ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
          {info}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{info}</div>
      )}
      <Button
        size="sm"
        variant={actionVariant}
        disabled={disabled}
        onClick={onAction}
        className="shrink-0"
      >
        {action}
      </Button>
    </li>
  );
}
