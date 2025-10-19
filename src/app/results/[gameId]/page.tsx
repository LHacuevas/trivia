'use client';
import { Suspense } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import type { Game } from '@/lib/types';
import ResultsDisplay from '@/components/game/ResultsDisplay';
import { Skeleton } from '@/components/ui/skeleton';


function ResultsLoadingSkeleton() {
  return (
      <div className="container mx-auto p-4 lg:p-8">
          <div className="flex flex-col items-center text-center mb-12">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-64 mt-4" />
              <Skeleton className="h-6 w-80 mt-2" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-8">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4">
                  <Skeleton className="h-96 w-full" />
              </div>
          </div>
      </div>
  );
}

function LocalResultsPage() {
    const searchParams = useSearchParams();
    const gameDataString = searchParams.get('game');

    let gameData: Game | null = null;

    if (gameDataString) {
        try {
            gameData = JSON.parse(decodeURIComponent(gameDataString));
        } catch (error) {
            console.error("Failed to parse game data from URL", error);
        }
    }

    if (!gameData) {
        // This can happen if the URL is malformed or the data is missing
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <h1 className="text-2xl font-bold">Could not load game results.</h1>
                <p>The game data might be missing or corrupted.</p>
            </div>
        );
    }

    return <ResultsDisplay game={gameData} />;
}


export default function ResultsPage({ params }: { params: { gameId: string } }) {

    if (params.gameId !== 'local') {
        // Currently we only support local games, so we can show a not found page for other gameIds
        // In the future, this could fetch from firestore
        notFound();
    }

    return (
        <Suspense fallback={<ResultsLoadingSkeleton />}>
            <LocalResultsPage />
        </Suspense>
    );
}
