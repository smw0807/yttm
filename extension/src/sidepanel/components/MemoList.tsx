import React from 'react';
import { MemoItem } from './MemoItem';
import type { MemoWithId } from '../../types';

interface Props {
  memos: MemoWithId[];
  loading: boolean;
  onUpdate: (memoId: string, content: string) => Promise<void>;
  onDelete: (memoId: string) => Promise<void>;
}

export function MemoList({ memos, loading, onUpdate, onDelete }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-gray-400 gap-2">
        <span className="text-2xl">📝</span>
        <p>메모가 없습니다</p>
        <p className="text-xs">플로팅 버튼 또는 Alt+M으로 메모를 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {memos.map((memo) => (
        <MemoItem key={memo.id} memo={memo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
