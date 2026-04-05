'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { AdminUserRow } from '@/lib/firebase/admin-stats';

type VideoItem = { id: string; title: string; thumbnail: string; youtubeId: string };
type CollectionItem = { id: string; name: string; description: string; videoCount: number };
type DetailData = { videos: VideoItem[]; collections: CollectionItem[] };

type Labels = {
  registeredVideos: string;
  registeredCollections: string;
  noVideos: string;
  noCollections: string;
  loading: string;
  videoCountTemplate: string;
};

type Props = {
  user: AdminUserRow;
  labels: Labels;
};

export function UserDetailRow({ user, labels }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [detail, setDetail] = useState<DetailData | null>(null);

  async function handleClick() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!detail) {
      setFetching(true);
      const res = await fetch(`/api/admin/users/${user.uid}`);
      const data: DetailData = await res.json();
      setDetail(data);
      setFetching(false);
    }
  }

  function formatVideoCount(count: number) {
    return labels.videoCountTemplate.replace('{count}', String(count));
  }

  return (
    <>
      <tr className="cursor-pointer hover:bg-muted/30" onClick={handleClick}>
        <td className="px-4 py-3 text-muted-foreground">{user.email ?? '-'}</td>
        <td className="px-4 py-3">{user.name ?? '-'}</td>
        <td className="px-4 py-3 text-right">{user.videoCount}</td>
        <td className="px-4 py-3 text-right">{user.collectionCount}</td>
        <td className="px-4 py-3 text-muted-foreground">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
        </td>
        <td className="px-4 py-3 text-center text-muted-foreground">
          {expanded ? <ChevronUp className="mx-auto h-4 w-4" /> : <ChevronDown className="mx-auto h-4 w-4" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-muted/10 px-6 py-4">
            {fetching ? (
              <p className="text-sm text-muted-foreground">{labels.loading}</p>
            ) : detail ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">{labels.registeredVideos}</h3>
                  {detail.videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{labels.noVideos}</p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.videos.map((v) => (
                        <li key={v.id}>
                          <Link
                            href={`/videos/${v.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 rounded hover:bg-muted/50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="h-9 w-16 rounded object-cover"
                            />
                            <span className="text-sm hover:underline">{v.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">{labels.registeredCollections}</h3>
                  {detail.collections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{labels.noCollections}</p>
                  ) : (
                    <ul className="space-y-1">
                      {detail.collections.map((c) => (
                        <li key={c.id} className="flex justify-between text-sm">
                          <span>{c.name}</span>
                          <span className="text-muted-foreground">{formatVideoCount(c.videoCount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </td>
        </tr>
      )}
    </>
  );
}
