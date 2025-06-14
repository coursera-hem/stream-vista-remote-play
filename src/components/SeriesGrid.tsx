
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
      <div className="text-center py-12">
        <p className="text-gray-400 text-xl">No series available yet.</p>
        <p className="text-gray-500 text-sm mt-2">Check console for debugging information.</p>
        <p className="text-gray-500 text-sm mt-1">
          Checked both 'series' and 'movies' collections for series data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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
