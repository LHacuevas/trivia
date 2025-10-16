'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@/lib/types';
import { AVATAR_KEYS, AVATARS } from '@/lib/avatars';
import PlayerAvatar from './PlayerAvatar';
import { cn } from '@/lib/utils';
import { UserPlus, X, Crown } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const MAX_PLAYERS = 9;

export default function PlayerSetup() {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_KEYS[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      toast({ title: 'Error', description: 'Player name cannot be empty.', variant: 'destructive' });
      return;
    }
    if (players.length >= MAX_PLAYERS) {
      toast({ title: 'Error', description: `Cannot add more than ${MAX_PLAYERS} players.`, variant: 'destructive' });
      return;
    }
    if (players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase())) {
        toast({ title: 'Error', description: 'Player name must be unique.', variant: 'destructive' });
        return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: playerName.trim(),
      avatar: selectedAvatar,
      score: 0,
    };
    setPlayers([...players, newPlayer]);
    setPlayerName('');
  };
  
  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  }

  const handleStartGame = () => {
    if (players.length < 1) {
      toast({ title: 'Error', description: 'Add at least one player to start.', variant: 'destructive' });
      return;
    }
    const playerJson = JSON.stringify(players);
    router.push(`/game?players=${encodeURIComponent(playerJson)}`);
  };

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Add New Player</h3>
                <Input
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                />
                <div>
                    <h4 className="font-medium text-sm mb-2">Choose an Avatar</h4>
                    <ScrollArea className="w-full">
                        <div className="flex space-x-2 pb-4">
                        {AVATAR_KEYS.map((key) => {
                            const Icon = AVATARS[key];
                            return (
                                <button
                                key={key}
                                onClick={() => setSelectedAvatar(key)}
                                className={cn(
                                    'p-2 rounded-full transition-all duration-200',
                                    selectedAvatar === key ? 'bg-primary ring-2 ring-primary-foreground ring-offset-2 ring-offset-background' : 'bg-secondary hover:bg-muted'
                                )}
                                >
                                <Icon className={cn('w-8 h-8', selectedAvatar === key ? 'text-primary-foreground' : 'text-secondary-foreground')} />
                                </button>
                            );
                        })}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
                <Button onClick={handleAddPlayer} disabled={players.length >= MAX_PLAYERS || !playerName.trim()}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Player
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Registered Players ({players.length}/{MAX_PLAYERS})</h3>
                {players.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {players.map((player, index) => (
                    <div key={player.id} className="relative flex flex-col items-center p-3 border rounded-lg bg-card shadow-sm">
                        <button onClick={() => handleRemovePlayer(player.id)} className="absolute top-1 right-1 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                        {index === 0 && <Crown className="absolute -top-3 -left-3 w-6 h-6 text-accent transform -rotate-45" />}
                        <PlayerAvatar avatar={player.avatar} className="w-16 h-16" />
                        <p className="mt-2 text-sm font-medium truncate w-full text-center">{player.name}</p>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-8 h-full">
                    <p>No players have joined yet.</p>
                    <p className="text-sm">Add a player to get started!</p>
                </div>
                )}
            </div>
        </div>
      
        <div className="text-center mt-8">
            <Button size="lg" onClick={handleStartGame} disabled={players.length === 0} className="w-full md:w-auto shadow-lg">
                Start Game
            </Button>
        </div>
    </div>
  );
}
