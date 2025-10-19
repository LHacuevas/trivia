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
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight, HelpCircle } from 'lucide-react';
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
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

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
        const selectedQuestions = shuffle([...staticTriviaQuestions]); // Shuffle all questions
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
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

  const activePlayer = useMemo(() => players[activePlayerIndex], [players, activePlayerIndex]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(TIME_PER_QUESTION);
      setGamePhase('playing');
    } else {
      setGamePhase('finished');
      finishGame(players, gameHistory);
    }
  }, [currentQuestionIndex, questions.length, players, gameHistory]);

  const finishGame = (finalPlayers: Player[], finalHistory: GameHistoryEntry[]) => {
     const finalGameData: Game = {
        id: crypto.randomUUID(),
        players: finalPlayers,
        history: finalHistory,
        questions: questions.slice(0, finalHistory.length),
        status: 'finished',
        createdAt: new Date().toISOString(),
      };

      const gameDataString = encodeURIComponent(JSON.stringify(finalGameData));
      router.push(`/results/local?game=${gameDataString}`);
  }

  const handleAnswer = (result: 'correct' | 'incorrect' | 'error') => {
    if (gamePhase !== 'reveal') return;

    const newGameHistoryEntry: GameHistoryEntry = {
      question: currentQuestion.question,
      category: currentQuestion.category,
      correctAnswer: currentQuestion.answer,
      players: [{
        name: activePlayer.name,
        answer: result,
        isCorrect: result === 'correct',
      }]
    };
    const updatedHistory = [...gameHistory, newGameHistoryEntry];
    setGameHistory(updatedHistory);

    let updatedPlayers = [...players];
    let nextPlayerIndex = activePlayerIndex;

    if (result === 'correct') {
      updatedPlayers = players.map((player, index) => 
        index === activePlayerIndex ? { ...player, score: player.score + 10 } : player
      );
      setPlayers(updatedPlayers);
      goToNextQuestion();
    } else if (result === 'incorrect') {
      nextPlayerIndex = (activePlayerIndex + 1) % players.length;
      setActivePlayerIndex(nextPlayerIndex);
      goToNextQuestion();
    } else if (result === 'error') {
      // Same player, next question
      goToNextQuestion();
    }

    if (currentQuestionIndex + 1 >= questions.length) {
        setGamePhase('finished');
        finishGame(updatedPlayers, updatedHistory);
    }
  };


  if (gamePhase === 'loading' || !currentQuestion || !activePlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Preparando el juego...</p>
      </div>
    );
  }
  
  if (gamePhase === 'finished') {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold">¡Juego Terminado!</h1>
        <p className="mt-4 text-xl text-muted-foreground">Calculando resultados finales...</p>
        <Loader2 className="h-8 w-8 animate-spin mt-4" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Pregunta {currentQuestionIndex + 1}</CardDescription>
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
                      <CardTitle>Turno de: {activePlayer.name}</CardTitle>
                      <CardDescription>¿Estás listo?</CardDescription>
                    </CardHeader>
                  </Card>

                  <Button onClick={() => setGamePhase('reveal')} className="w-full">
                      Revelar Respuesta <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {gamePhase === 'reveal' && (
                <div className="space-y-4 animate-in fade-in-50">
                   <Alert className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
                    <AlertTitle className="font-bold">La respuesta correcta es: {currentQuestion.answer}</AlertTitle>
                  </Alert>
                  
                  <div className='text-center'>
                    <p className='text-muted-foreground mb-2'>¿Cómo le fue a {activePlayer.name}?</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => handleAnswer('correct')} variant="default" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2"/> Correcta
                        </Button>
                        <Button onClick={() => handleAnswer('incorrect')} variant="destructive">
                            <XCircle className="mr-2"/> Incorrecta
                        </Button>
                        <Button onClick={() => handleAnswer('error')} variant="secondary">
                            <HelpCircle className="mr-2"/> Erronea
                        </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="order-1 lg:order-2">
          <Leaderboard players={players} activePlayerId={activePlayer.id} />
        </div>
      </div>
    </div>
  );
}
