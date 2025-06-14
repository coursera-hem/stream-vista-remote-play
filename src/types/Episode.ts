
export interface Episode {
  id: string;
  animeId?: string;  // For anime episodes
  seriesId?: string; // For series episodes
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  airDate?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEpisodeData {
  animeId?: string;
  seriesId?: string;
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  airDate?: Date;
}
