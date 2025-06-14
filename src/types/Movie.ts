
export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  description: string;
  videoUrl?: string;
  releaseYear?: number | { _type: string; value: string };
  language?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  views?: number;
}
