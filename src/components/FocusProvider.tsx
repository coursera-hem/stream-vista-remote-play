
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface FocusContextType {
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
  navigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within FocusProvider');
  }
  return context;
};

interface FocusProviderProps {
  children: React.ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [focusedElement, setFocusedElement] = useState<string | null>('sidebar-toggle-0');

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusedElement) return;

    console.log('Current focused element:', focusedElement);
    console.log('Navigation direction:', direction);

    // Define navigation priorities and fallbacks
    const navigationMap: Record<string, Record<string, string[]>> = {
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
    };

    // Try specific navigation mapping first
    if (navigationMap[focusedElement] && navigationMap[focusedElement][direction]) {
      const targets = navigationMap[focusedElement][direction];
      for (const target of targets) {
        const element = document.getElementById(target);
        if (element) {
          console.log('Found specific navigation target:', target);
          setFocusedElement(target);
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          return;
        }
      }
    }

    // Fallback to general navigation for content areas
    const [section, row, col] = focusedElement.split('-');
    const rowNum = parseInt(row);
    const colNum = parseInt(col);

    let newFocusId = focusedElement;

    switch (direction) {
      case 'left':
        if (colNum > 0) {
          newFocusId = `${section}-${row}-${colNum - 1}`;
        } else {
          // If at leftmost, try to go to sidebar or hero
          if (section === 'home') {
            const fallbacks = ['hero-play-0', 'sidebar-toggle-0'];
            for (const fallback of fallbacks) {
              const element = document.getElementById(fallback);
              if (element) {
                setFocusedElement(fallback);
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                return;
              }
            }
          }
        }
        break;
      case 'right':
        newFocusId = `${section}-${row}-${colNum + 1}`;
        break;
      case 'up':
        if (section === 'home' && rowNum > 0) {
          newFocusId = `${section}-${rowNum - 1}-${col}`;
        } else if (section === 'home' && rowNum === 0) {
          // If at top row, try to go to hero or navbar
          const fallbacks = ['hero-play-0', 'nav-home-0', 'nav-search-0'];
          for (const fallback of fallbacks) {
            const element = document.getElementById(fallback);
            if (element) {
              setFocusedElement(fallback);
              element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              return;
            }
          }
        }
        break;
      case 'down':
        if (section === 'home') {
          newFocusId = `${section}-${rowNum + 1}-${col}`;
        }
        break;
    }

    console.log('Attempting to focus:', newFocusId);

    const targetElement = document.getElementById(newFocusId);
    if (targetElement) {
      console.log('Target element found, setting focus');
      setFocusedElement(newFocusId);
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      console.log('Target element not found:', newFocusId);
      
      // Try to find the next available element in the same row
      if (direction === 'right') {
        let attemptCol = 0;
        while (attemptCol < 10) {
          const attemptId = `${section}-${row}-${attemptCol}`;
          const attemptElement = document.getElementById(attemptId);
          if (attemptElement) {
            console.log('Found alternative element:', attemptId);
            setFocusedElement(attemptId);
            attemptElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            break;
          }
          attemptCol++;
        }
      }
      
      // Try next/previous row for up/down navigation
      if (direction === 'down') {
        let attemptRow = rowNum + 1;
        while (attemptRow < 15) {
          const attemptId = `${section}-${attemptRow}-0`;
          const attemptElement = document.getElementById(attemptId);
          if (attemptElement) {
            console.log('Found next row element:', attemptId);
            setFocusedElement(attemptId);
            attemptElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            break;
          }
          attemptRow++;
        }
      }
      
      if (direction === 'up') {
        let attemptRow = rowNum - 1;
        while (attemptRow >= 0) {
          const attemptId = `${section}-${attemptRow}-0`;
          const attemptElement = document.getElementById(attemptId);
          if (attemptElement) {
            console.log('Found previous row element:', attemptId);
            setFocusedElement(attemptId);
            attemptElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            break;
          }
          attemptRow--;
        }
      }
    }
  }, [focusedElement]);

  const handleElementClick = useCallback(() => {
    if (!focusedElement) {
      console.log('No focused element to click');
      return;
    }

    console.log('Attempting to click element:', focusedElement);
    const element = document.getElementById(focusedElement);
    
    if (!element) {
      console.log('Element not found:', focusedElement);
      return;
    }

    console.log('Element found, triggering click');
    
    // Create and dispatch a proper click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    element.dispatchEvent(clickEvent);
    
    // Also try direct click as fallback
    if (element.click) {
      element.click();
    }
  }, [focusedElement]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    console.log('Key pressed:', e.key, 'Focused element:', focusedElement);
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigate('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigate('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigate('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigate('right');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        console.log('Enter/Space pressed, attempting to click element');
        handleElementClick();
        break;
      default:
        console.log('Unhandled key:', e.key);
        break;
    }
  }, [navigate, handleElementClick, focusedElement]);

  useEffect(() => {
    console.log('Adding keyboard event listener');
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      console.log('Removing keyboard event listener');
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    console.log('Focused element changed to:', focusedElement);
  }, [focusedElement]);

  return (
    <FocusContext.Provider value={{ focusedElement, setFocusedElement, navigate }}>
      {children}
    </FocusContext.Provider>
  );
};
