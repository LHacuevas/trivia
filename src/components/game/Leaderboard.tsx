import type { Player } from '@/lib/types';
import PlayerAvatar from './PlayerAvatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Crown, Trophy, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface LeaderboardProps {
  players: Player[];
  activePlayerId?: string;
}

const Leaderboard = ({ players, activePlayerId }: LeaderboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="shadow-lg sticky top-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="text-primary" />
          <CardTitle>Puntuación</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  'flex items-center p-3 rounded-lg transition-all duration-300 relative',
                  index === 0 && 'bg-gradient-to-r from-accent/30 to-accent/10 border-accent/50 border-2 shadow-lg',
                  player.id === activePlayerId && 'ring-2 ring-primary',
                  index !== 0 && player.id !== activePlayerId && 'bg-secondary'
                )}
              >
                {player.id === activePlayerId && <UserCheck className="absolute -left-3 -top-2 w-5 h-5 text-primary bg-background rounded-full p-0.5" />}
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-bold text-lg w-6 text-center">{index + 1}</span>
                  <PlayerAvatar avatar={player.avatar} className="w-10 h-10" />
                  <p className="font-medium truncate flex-1">{player.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-6 h-6 text-accent" />}
                  <span className="font-bold text-lg text-primary">{player.score}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
