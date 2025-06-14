
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Calendar, Star } from 'lucide-react';

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

interface SeriesCardProps {
  series: Series;
  onSelect: (series: Series) => void;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, onSelect }) => {
  return (
    <Card
      className="group cursor-pointer bg-gray-900 border-gray-800 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
      onClick={() => onSelect(series)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="aspect-[2/3] bg-gray-800">
          <img
            src={series.poster}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/300x450/1f2937/ffffff?text=${encodeURIComponent(series.title)}`;
            }}
          />
        </div>
        
        {/* Status Badge */}
        <Badge 
          className={`absolute top-3 right-3 ${
            series.status === 'completed' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {series.status}
        </Badge>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg group-hover:text-red-400 transition-colors line-clamp-2">
            {series.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{series.description}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{series.releaseYear}</span>
          </div>
          {series.totalEpisodes && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>{series.totalEpisodes} episodes</span>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
            {series.genre}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
