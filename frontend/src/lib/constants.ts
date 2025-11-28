
import { EmotionDetails } from './types';

export const EMOTIONS: Record<string, EmotionDetails> = {
  happy: {
    id: 'happy',
    label: 'Happy',
    description: 'Feeling joyful, content, or pleased',
    color: 'from-yellow-400 to-amber-500',
    icon: 'smile',
  },
  sad: {
    id: 'sad',
    label: 'Sad',
    description: 'Feeling down, blue, or unhappy',
    color: 'from-blue-400 to-indigo-500',
    icon: 'frown',
  },
  angry: {
    id: 'angry',
    label: 'Angry',
    description: 'Feeling frustrated, irritated, or enraged',
    color: 'from-red-400 to-rose-500',
    icon: 'flame',
  },
  fearful: {
    id: 'fearful',
    label: 'Fearful',
    description: 'Feeling scared, anxious, or worried',
    color: 'from-purple-400 to-violet-500',
    icon: 'skull',
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised',
    description: 'Feeling astonished or taken aback',
    color: 'from-pink-400 to-fuchsia-500',
    icon: 'zap',
  },
  disgusted: {
    id: 'disgusted',
    label: 'Disgusted',
    description: 'Feeling repulsed or revolted',
    color: 'from-green-400 to-emerald-500',
    icon: 'x-circle',
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    description: 'Feeling balanced or emotionally neutral',
    color: 'from-gray-400 to-slate-500',
    icon: 'minus-circle',
  },
  relaxed: {
    id: 'relaxed',
    label: 'Relaxed',
    description: 'Feeling calm, at ease, or peaceful',
    color: 'from-sky-400 to-cyan-500',
    icon: 'coffee',
  },
};

export const APP_NAME = 'EmoFlix';
export const APP_DESCRIPTION = 'Discover movies that match your mood';
