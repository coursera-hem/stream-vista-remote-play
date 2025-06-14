
import { NavigationMap } from '../types/focus';

export const getNavigationMap = (): NavigationMap => ({
  // Sidebar toggle navigation
  'sidebar-toggle-0': {
    right: ['nav-logo-0', 'nav-home-0', 'nav-search-0'],
    down: ['hero-play-0', 'home-0-0'],
    up: ['nav-logo-0']
  },
  
  // Navigation bar elements
  'nav-logo-0': {
    right: ['nav-home-0', 'nav-movies-0'],
    down: ['hero-play-0', 'home-0-0'],
    left: ['sidebar-toggle-0']
  },
  'nav-home-0': {
    right: ['nav-movies-0', 'nav-anime-0'],
    left: ['nav-logo-0', 'sidebar-toggle-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-movies-0': {
    right: ['nav-anime-0', 'nav-mylist-0'],
    left: ['nav-home-0', 'nav-logo-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-anime-0': {
    right: ['nav-mylist-0', 'nav-admin-0', 'nav-search-0'],
    left: ['nav-movies-0', 'nav-home-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-mylist-0': {
    right: ['nav-admin-0', 'nav-search-0', 'nav-user-0'],
    left: ['nav-anime-0', 'nav-movies-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-admin-0': {
    right: ['nav-search-0', 'nav-user-0'],
    left: ['nav-mylist-0', 'nav-anime-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-search-0': {
    right: ['nav-user-0', 'nav-signin-0', 'nav-menu-0'],
    left: ['nav-admin-0', 'nav-mylist-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-user-0': {
    left: ['nav-search-0', 'nav-admin-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-signin-0': {
    left: ['nav-search-0', 'nav-admin-0'],
    down: ['hero-play-0', 'home-0-0']
  },
  'nav-menu-0': {
    left: ['nav-search-0', 'nav-user-0'],
    down: ['hero-play-0', 'home-0-0']
  },

  // Hero section elements
  'hero-play-0': {
    right: ['hero-info-0', 'hero-watchlist-0'],
    up: ['nav-home-0', 'nav-search-0'],
    down: ['home-0-0', 'home-1-0'],
    left: ['sidebar-toggle-0']
  },
  'hero-info-0': {
    left: ['hero-play-0'],
    right: ['hero-watchlist-0'],
    up: ['nav-search-0', 'nav-user-0'],
    down: ['home-0-0', 'home-1-0']
  },
  'hero-watchlist-0': {
    left: ['hero-info-0', 'hero-play-0'],
    up: ['nav-user-0', 'nav-search-0'],
    down: ['home-0-0', 'home-1-0']
  }
});
