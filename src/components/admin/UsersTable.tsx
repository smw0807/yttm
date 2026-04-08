'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UserDetailRow } from './UserDetailRow';
import type { AdminUserRow } from '@/lib/firebase/admin-stats';

type SortKey = 'email' | 'name' | 'videoCount' | 'collectionCount' | 'createdAt';
type SortDir = 'asc' | 'desc';

type Labels = {
  email: string;
  name: string;
  videos: string;
  collections: string;
  joined: string;
  registeredVideos: string;
  registeredCollections: string;
  noVideos: string;
  noCollections: string;
  loading: string;
  videoCountTemplate: string;
};

type Props = {
  users: AdminUserRow[];
  labels: Labels;
};

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return sortDir === 'asc' ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}

export function UsersTable({ users, labels }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('videoCount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'videoCount' || sortKey === 'collectionCount') {
        cmp = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
      } else {
        cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  const rowLabels = {
    registeredVideos: labels.registeredVideos,
    registeredCollections: labels.registeredCollections,
    noVideos: labels.noVideos,
    noCollections: labels.noCollections,
    loading: labels.loading,
    videoCountTemplate: labels.videoCountTemplate,
  };

  const thClass = 'px-4 py-3 font-medium cursor-pointer select-none hover:bg-muted/80 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className={`${thClass} text-left`} onClick={() => handleSort('email')}>
              {labels.email}
              <SortIcon column="email" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${thClass} text-left`} onClick={() => handleSort('name')}>
              {labels.name}
              <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${thClass} text-right`} onClick={() => handleSort('videoCount')}>
              {labels.videos}
              <SortIcon column="videoCount" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${thClass} text-right`} onClick={() => handleSort('collectionCount')}>
              {labels.collections}
              <SortIcon column="collectionCount" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${thClass} text-left`} onClick={() => handleSort('createdAt')}>
              {labels.joined}
              <SortIcon column="createdAt" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((u) => (
            <UserDetailRow key={u.uid} user={u} labels={rowLabels} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
