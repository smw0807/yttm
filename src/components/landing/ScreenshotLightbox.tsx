'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

interface Props {
  src: StaticImageData;
  alt: string;
}

export default function ScreenshotLightbox({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label="스크린샷 크게 보기"
      >
        <Image src={src} alt={alt} className="w-full" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="닫기"
          >
            ✕
          </button>

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] cursor-zoom-out overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
