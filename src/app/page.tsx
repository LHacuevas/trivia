'use client';

import PlayerSetup from '@/components/game/PlayerSetup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">
          Trivia Titans
        </h1>
        <p className="mt-2 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Assemble your team of titans. Add up to 9 players and prepare for a battle of wits!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Game Lobby</CardTitle>
            <CardDescription>Register players to start the game.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerSetup />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
