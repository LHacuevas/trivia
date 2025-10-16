'use client';
import { Suspense } from 'react';
import GameContainer from '@/components/game/GameContainer';
import { Skeleton } from '@/components/ui/skeleton';

function GameLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<GameLoadingSkeleton />}>
      <GameContainer />
    </Suspense>
  );
}
