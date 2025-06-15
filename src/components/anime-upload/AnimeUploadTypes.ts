
export interface AnimeFormData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  poster: string;
  status: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
}

export interface AnimeData {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  poster: string;
  status: string;
  rating: number;
  language: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
  episodes: number;
  videoUrl: string;
  uploadedAt: Date;
}

export const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Animation', 'Fantasy'];
export const LANGUAGES = ['Japanese', 'English', 'Korean', 'Chinese', 'Other'];
export const STATUSES = ['Ongoing', 'Completed', 'Coming Soon'];

export const DEFAULT_FORM_DATA: AnimeFormData = {
  title: '',
  description: '',
  genre: 'Action',
  releaseYear: new Date().getFullYear(),
  poster: '',
  status: 'Ongoing',
  rating: 8.0,
  language: 'Japanese',
  isTrending: false,
  isFeatured: false
};
