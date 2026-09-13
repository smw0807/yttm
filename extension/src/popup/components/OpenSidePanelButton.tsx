import React from 'react';

export function OpenSidePanelButton() {
  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
    window.close();
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      사이드 패널 열기
    </button>
  );
}
