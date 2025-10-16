import type { LucideIcon } from 'lucide-react';
import { Gem, Ghost, Cat, Dog, Bird, Bug, Fish, Croissant, Pizza, Rocket, Plane, Skull } from 'lucide-react';

export const AVATARS: Record<string, LucideIcon> = {
  gem: Gem,
  ghost: Ghost,
  cat: Cat,
  dog: Dog,
  bird: Bird,
  bug: Bug,
  fish: Fish,
  croissant: Croissant,
  pizza: Pizza,
  rocket: Rocket,
  plane: Plane,
  skull: Skull,
};

export const AVATAR_KEYS = Object.keys(AVATARS);
