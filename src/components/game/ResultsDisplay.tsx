'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import type { Game } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Crown, RefreshCw, Loader2, Sparkles, Check, X } from 'lucide-react';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import { summarizeGameHistory } from '@/ai/flows/summarize-game-history';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ResultsDisplayProps {
    game: Game;
}

export default function ResultsDisplay({ game }: ResultsDisplayProps) {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const { players, history } = game;

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const winner = useMemo(() => sortedPlayers[0], [sortedPlayers]);

  useEffect(() => {
    if (winner && history.length > 0) {
      const generateSummary = async () => {
        setIsLoadingSummary(true);
        try {
          const gameHistoryString = history.map(h => 
            `Question: "${h.question}" (Category: ${h.category}, Answer: ${h.correctAnswer})\n` +
            h.players.map(p => `  - ${p.name} answered "${p.answer}" (${p.isCorrect ? 'Correct' : 'Incorrect'})`).join('\n')
          ).join('\n\n');

          const result = await summarizeGameHistory({
            gameHistory: gameHistoryString,
            playerName: winner.name,
          });
          setSummary(result.summary);
        } catch (error) {
          console.error("Failed to generate summary:", error);
          setSummary("Could not generate an AI summary for this game.");
        } finally {
          setIsLoadingSummary(false);
        }
      };
      generateSummary();
    }
  }, [winner, history]);

  if (!winner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span>Loading results...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center text-center">
        <Trophy className="h-24 w-24 text-accent drop-shadow-lg" />
        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">
          Game Over!
        </h1>
        <p className="mt-2 text-lg md:text-xl text-muted-foreground">Congratulations to the winner!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12 items-start">
        <div className="md:col-span-2 space-y-8">
            <Card className="bg-gradient-to-br from-card to-secondary shadow-2xl">
                <CardHeader className="text-center items-center">
                    <PlayerAvatar avatar={winner.avatar} className="w-24 h-24 border-4 border-accent" />
                    <CardTitle className="text-3xl font-bold mt-2">{winner.name}</CardTitle>
                    <CardDescription className="text-lg flex items-center gap-2">
                        <Crown className="w-5 h-5 text-accent" />
                        Trivia Titan
                        <Crown className="w-5 h-5 text-accent" />
                    </CardDescription>
                    <p className="text-4xl font-black text-primary">{winner.score} <span className="text-2xl font-bold text-muted-foreground">Points</span></p>
                </CardHeader>
                <CardContent>
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Performance Summary
                    </h3>
                    {isLoadingSummary ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating analysis...</span>
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic border-l-4 border-primary pl-4">{summary}</p>
                    )}
                </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-bold">Game History</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        {history.map((entry, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="text-lg">Q{index+1}: {entry.question}</CardTitle>
                                    <CardDescription>Answer: {entry.correctAnswer}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm">
                                    {entry.players.map(p => (
                                        <li key={p.name} className="flex justify-between items-center">
                                            <span>{p.name}: "{p.answer}"</span>
                                            {p.isCorrect ? <Check className="w-4 h-4 text-green-500"/> : <X className="w-4 h-4 text-destructive"/>}
                                        </li>
                                    ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        <div className="space-y-4 sticky top-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Final Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {sortedPlayers.map((player, index) => (
                            <li key={player.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold w-5">{index + 1}.</span>
                                    <PlayerAvatar avatar={player.avatar} className="w-8 h-8"/>
                                    <span className="font-medium">{player.name}</span>
                                </div>
                                <span className="font-bold text-primary">{player.score}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Button onClick={() => router.push('/')} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Play Again
            </Button>
        </div>
      </div>
    </div>
  );
}
