'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddVideoSearchTab } from '@/components/videos/AddVideoSearchTab';
import { AddVideoUrlTab } from '@/components/videos/AddVideoUrlTab';
import { useAddVideoDialog, type AddVideoTab } from '@/hooks/useAddVideoDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddVideoDialog({ open, onClose, onAdded }: Props) {
  const t = useTranslations('addVideoDialog');
  const dialog = useAddVideoDialog({
    open,
    onClose,
    onAdded,
    defaultError: t('defaultError'),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {(['url', 'search'] as AddVideoTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => dialog.setTab(tab)}
              className={`border-b-2 px-3 pb-2 text-sm font-medium transition-colors ${
                dialog.tab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(tab === 'url' ? 'tabUrl' : 'tabSearch')}
            </button>
          ))}
        </div>

        {/* URL Tab */}
        {dialog.tab === 'url' && (
          <AddVideoUrlTab
            url={dialog.url}
            onUrlChange={dialog.setUrl}
            onSubmit={dialog.handleUrlSubmit}
            loading={dialog.urlLoading}
            error={dialog.urlError}
            labels={{
              urlPlaceholder: t('urlPlaceholder'),
              loadingButton: t('loadingButton'),
              addButton: t('addButton'),
            }}
          />
        )}

        {/* Search Tab */}
        {dialog.tab === 'search' && (
          <AddVideoSearchTab
            query={dialog.query}
            onQueryChange={dialog.setQuery}
            onSubmit={dialog.handleSearch}
            loading={dialog.searchLoading}
            error={dialog.searchError}
            results={dialog.searchResults}
            addingId={dialog.addingId}
            onAddResult={dialog.handleAddResult}
            labels={{
              searchPlaceholder: t('searchPlaceholder'),
              searching: t('searching'),
              searchButton: t('searchButton'),
              loadingButton: t('loadingButton'),
              addButton: t('addButton'),
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
