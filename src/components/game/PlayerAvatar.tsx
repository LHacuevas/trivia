import { AVATARS } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface PlayerAvatarProps {
  avatar: string;
  className?: string;
}

const PlayerAvatar = ({ avatar, className }: PlayerAvatarProps) => {
  const AvatarIcon = AVATARS[avatar] || User;

  return (
    <div
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center bg-muted border-2',
        className
      )}
    >
      <AvatarIcon className="w-2/3 h-2/3 text-muted-foreground" />
    </div>
  );
};

export default PlayerAvatar;
