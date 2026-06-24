'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';

import { Spinner } from '#/components/ui/spinner.tsx';
import { getImage } from '#/features/assets/api';
import { cn } from '#/lib/utils.ts';

type AssetImageProps = Readonly<{
  assetId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}>;

export function AssetImage({
  assetId,
  alt,
  width,
  height,
  className,
}: AssetImageProps) {
  const getImageFn = useServerFn(getImage);
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isActive = true;

    setSrc(null);
    setFailed(false);

    async function loadImage() {
      try {
        const imageSrc = await getImageFn({
          data: {
            assetId,
            width,
            height,
          },
        });

        if (isActive) {
          setSrc(imageSrc);
        }
      } catch {
        if (isActive) {
          setFailed(true);
        }
      }
    }

    void loadImage();

    return () => {
      isActive = false;
    };
  }, [assetId, getImageFn, height, width]);

  return (
    <div
      className={cn(
        'relative flex aspect-video overflow-hidden rounded-md border bg-muted',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          {failed ? (
            <ImageIcon aria-hidden="true" className="size-5" />
          ) : (
            <Spinner className="size-5" />
          )}
        </div>
      )}
    </div>
  );
}
