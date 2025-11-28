
export type User = {
  id: string;
  name: string;
  email: string;
};

export type Emotion = 
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'surprised'
  | 'disgusted'
  | 'neutral'
  | 'relaxed';

export type EmotionDetails = {
  id: Emotion;
  label: string;
  description: string;
  color: string;
  icon: string;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  poster: string;
  genres: string[];
  plot: string;
  rating: number;
  poster_path?: string; // Optional, as some movies might not have a poster
  release_date?: string; // Optional, as some movies might not have a release date
  vote_average?: number;
};

export type RecommendationHistory = {
  _id: string;
  timestamp: string;
  emotion: Emotion;
  movies: Movie[];
};
