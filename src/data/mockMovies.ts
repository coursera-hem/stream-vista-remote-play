
export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  description: string;
}

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    poster: 'https://images.unsplash.com/photo-1489599508175-b3c99833ed4c?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&h=1080&fit=crop',
    year: 2010,
    genre: 'Sci-Fi',
    rating: 8.8,
    duration: '2h 28m',
    description: 'A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  },
  {
    id: '2',
    title: 'The Matrix',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1920&h=1080&fit=crop',
    year: 1999,
    genre: 'Action',
    rating: 8.7,
    duration: '2h 16m',
    description: 'A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.'
  },
  {
    id: '3',
    title: 'Interstellar',
    poster: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop',
    year: 2014,
    genre: 'Sci-Fi',
    rating: 8.6,
    duration: '2h 49m',
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: '4',
    title: 'The Dark Knight',
    poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1920&h=1080&fit=crop',
    year: 2008,
    genre: 'Action',
    rating: 9.0,
    duration: '2h 32m',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.'
  },
  {
    id: '5',
    title: 'Blade Runner 2049',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1920&h=1080&fit=crop',
    year: 2017,
    genre: 'Sci-Fi',
    rating: 8.0,
    duration: '2h 44m',
    description: 'Young Blade Runner K discovers a long-buried secret that has the potential to upset the carefully maintained order of society.'
  },
  {
    id: '6',
    title: 'Dune',
    poster: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=300&h=450&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    year: 2021,
    genre: 'Adventure',
    rating: 8.0,
    duration: '2h 35m',
    description: "Paul Atreides leads nomadic tribes in a revolt against the evil House Harkonnen in their struggle to control the desert planet Arrakis."
  }
];

export const movieCategories = {
  trending: mockMovies.slice(0, 4),
  action: mockMovies.filter(m => m.genre === 'Action'),
  sciFi: mockMovies.filter(m => m.genre === 'Sci-Fi'),
  recent: mockMovies.filter(m => m.year >= 2015),
  topRated: mockMovies.filter(m => m.rating >= 8.5)
};
