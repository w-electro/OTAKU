'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      ...props
    },
    ref
  ) => {
    const variants = {
      text: 'rounded-md h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-xl',
    };

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-700/50',
          variants[variant],
          animations[animation],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Card Skeleton Component
const AnimeCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton variant="rounded" className="aspect-[2/3] w-full" />
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" height={12} />
  </div>
);

// Episode Card Skeleton
const EpisodeCardSkeleton = () => (
  <div className="flex gap-4 p-4 bg-gray-800/40 rounded-xl">
    <Skeleton variant="rounded" width={160} height={90} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" height={12} />
      <Skeleton variant="text" className="w-1/4" height={12} />
    </div>
  </div>
);

// Hero Skeleton
const HeroSkeleton = () => (
  <div className="relative h-[70vh] w-full">
    <Skeleton variant="rectangular" className="absolute inset-0" animation="wave" />
    <div className="absolute bottom-20 left-12 space-y-4 w-1/2">
      <Skeleton variant="text" className="w-1/3" height={48} />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <div className="flex gap-4 pt-4">
        <Skeleton variant="rounded" width={150} height={48} />
        <Skeleton variant="rounded" width={150} height={48} />
      </div>
    </div>
  </div>
);

export { Skeleton, AnimeCardSkeleton, EpisodeCardSkeleton, HeroSkeleton };
