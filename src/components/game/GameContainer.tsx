'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Player, TriviaQuestion, GameHistoryEntry, Game } from '@/lib/types';
import Leaderboard from './Leaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { staticTriviaQuestions } from '@/lib/trivia-questions';

const QUESTIONS_PER_GAME = 10;
const TIME_PER_QUESTION = 30; // seconds

function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export default function GameContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<'loading' | 'playing' | 'reveal' | 'finished'>('loading');
  
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});

  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState("");

  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

  useEffect(() => {
    const playersParam = searchParams.get('players');
    if (playersParam) {
      try {
        const parsedPlayers: Player[] = JSON.parse(playersParam);
        setPlayers(parsedPlayers);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load players. Redirecting to lobby.', variant: 'destructive' });
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    function initializeGame() {
      if (players.length > 0) {
        setGamePhase('loading');
        const selectedQuestions = shuffle([...staticTriviaQuestions]).slice(0, QUESTIONS_PER_GAME);
        setQuestions(selectedQuestions);
        setGamePhase('playing');
      }
    }
    initializeGame();
  }, [players]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGamePhase('reveal');
    }
  }, [timer, gamePhase]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleOpenAnswerModal = (player: Player) => {
    if (currentAnswers[player.id]) return; // Already answered
    setActivePlayer(player);
    setIsAnswerModalOpen(true);
  };
  
  const handleSubmitAnswer = () => {
    if (!activePlayer || !playerAnswer.trim()) return;
    setCurrentAnswers(prev => ({...prev, [activePlayer.id]: playerAnswer.trim()}));
    setIsAnswerModalOpen(false);
    setPlayerAnswer("");
    setActivePlayer(null);
  };

  const handleNextPhase = useCallback(async () => {
    if (gamePhase === 'reveal') {
      const correctAnswer = currentQuestion.answer;
      
      const newGameHistoryEntry: GameHistoryEntry = {
        question: currentQuestion.question,
        category: currentQuestion.category,
        correctAnswer: correctAnswer,
        players: players.map(p => ({
          name: p.name,
          answer: currentAnswers[p.id] || "No answer",
          isCorrect: (currentAnswers[p.id] || "").toLowerCase() === correctAnswer.toLowerCase(),
        }))
      };
      const updatedHistory = [...gameHistory, newGameHistoryEntry];
      setGameHistory(updatedHistory);


      const updatedPlayers = players.map(player => {
        if ((currentAnswers[player.id] || "").toLowerCase() === correctAnswer.toLowerCase()) {
          return { ...player, score: player.score + 10 };
        }
        return player;
      });
      setPlayers(updatedPlayers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswers({});
        setTimer(TIME_PER_QUESTION);
        setGamePhase('playing');
      } else {
        setGamePhase('finished');
        
        const finalGameData: Game = {
          id: crypto.randomUUID(),
          players: updatedPlayers,
          history: updatedHistory,
          questions: questions,
          status: 'finished',
          createdAt: new Date().toISOString(),
        };

        const gameDataString = encodeURIComponent(JSON.stringify(finalGameData));
        router.push(`/results/local?game=${gameDataString}`);
      }
    }
  }, [gamePhase, currentQuestion, players, currentAnswers, currentQuestionIndex, questions.length, router, gameHistory, questions]);

  const unansweredPlayers = useMemo(() => {
    return players.filter(p => !currentAnswers[p.id]);
  }, [players, currentAnswers]);

  if (gamePhase === 'loading' || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Preparing the game...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Question {currentQuestionIndex + 1} / {questions.length}</CardDescription>
                    <CardTitle className="text-2xl lg:text-3xl font-bold mt-1">{currentQuestion.question}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="whitespace-nowrap">{currentQuestion.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {gamePhase === 'playing' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-primary" />
                    <Progress value={(timer / TIME_PER_QUESTION) * 100} className="h-4" />
                    <span className="text-lg font-semibold tabular-nums">{timer}s</span>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Who will answer?</CardTitle>
                      <CardDescription>Click your name to submit an answer.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {players.map(player => {
                        const hasAnswered = !!currentAnswers[player.id];
                        return (
                          <Button 
                            key={player.id} 
                            variant={hasAnswered ? "secondary" : "outline"}
                            onClick={() => handleOpenAnswerModal(player)}
                            disabled={hasAnswered}
                            className="justify-start gap-2"
                          >
                            {hasAnswered ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4" />}
                            <span className="truncate">{player.name}</span>
                          </Button>
                        )
                      })}
                    </CardContent>
                  </Card>
                  {unansweredPlayers.length === 0 && (
                     <Button onClick={() => setGamePhase('reveal')} className="w-full">
                        Reveal Answer <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                  )}
                </div>
              )}

              {gamePhase === 'reveal' && (
                <div className="space-y-4 animate-in fade-in-50">
                   <Alert className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
                    <AlertTitle className="font-bold">The correct answer is: {currentQuestion.answer}</AlertTitle>
                  </Alert>

                  <div className="space-y-2">
                    {players.map(player => {
                      const playerAnswer = currentAnswers[player.id] || "No answer";
                      const isCorrect = playerAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
                      return (
                        <div key={player.id} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                          <p className="font-medium">{player.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-muted-foreground italic truncate max-w-[150px]">{playerAnswer}</p>
                            {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <Button onClick={handleNextPhase} className="w-full">
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="order-1 lg:order-2">
          <Leaderboard players={players} />
        </div>
      </div>

      <Dialog open={isAnswerModalOpen} onOpenChange={setIsAnswerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>It's your turn, {activePlayer?.name}!</DialogTitle>
            <DialogDescription>Enter your answer for the question below. No cheating!</DialogDescription>
          </DialogHeader>
          <p className="font-semibold italic text-muted-foreground">"{currentQuestion.question}"</p>
          <Input 
            placeholder="Type your answer here..."
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
          />
          <DialogFooter>
            <Button onClick={handleSubmitAnswer} disabled={!playerAnswer.trim()}>Submit Answer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
