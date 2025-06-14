
import React from 'react';
import { SeriesCard } from './SeriesCard';

interface Series {
  id: string;
  title: string;
  description: string;
  poster: string;
  genre: string;
  releaseYear: number;
  language: string;
  type: 'series';
  totalEpisodes?: number;
  status: 'ongoing' | 'completed';
}

interface SeriesGridProps {
  series: Series[];
  onSeriesSelect: (series: Series) => void;
}

export const SeriesGrid: React.FC<SeriesGridProps> = ({ series, onSeriesSelect }) => {
  if (series.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
        <p className="text-gray-400 text-lg sm:text-xl lg:text-2xl">No series available yet.</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">Check console for debugging information.</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Checked both 'series' and 'movies' collections for series data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8">
      {series.map((seriesItem) => (
        <SeriesCard
          key={seriesItem.id}
          series={seriesItem}
          onSelect={onSeriesSelect}
        />
      ))}
    </div>
  );
};
