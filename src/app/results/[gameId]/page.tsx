import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

async function getGameData(gameId: string): Promise<Game | null> {
    try {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            return null;
        }
        
        const data = gameSnap.data();
        
        // Firestore Timestamps are not serializable for Next.js server->client prop passing.
        const serializableData = JSON.parse(JSON.stringify(data));

        return {
            id: gameSnap.id,
            ...serializableData
        } as Game;
    } catch (error) {
        console.error("Error fetching game data:", error);
        return null;
    }
}

export default async function ResultsPage({ params }: { params: { gameId: string } }) {
    const gameData = await getGameData(params.gameId);

    if (!gameData) {
        notFound();
    }

    return (
        <Suspense fallback={<ResultsLoadingSkeleton />}>
            <ResultsDisplay game={gameData} />
        </Suspense>
    );
}
