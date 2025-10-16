import { Trophy } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex items-center gap-2">
        <Trophy className="text-primary h-7 w-7" />
        <Link href="/" className="text-xl font-bold tracking-tight">
          Trivia Titans
        </Link>
      </div>
    </header>
  );
};

export default Header;
