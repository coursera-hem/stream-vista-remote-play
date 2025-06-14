
import { useCallback } from 'react';
import { NavigationDirection } from '../types/focus';
import { getNavigationMap } from '../utils/navigationMap';

export const useFocusNavigation = (
  focusedElement: string | null,
  setFocusedElement: (id: string | null) => void
) => {
  const navigate = useCallback((direction: NavigationDirection) => {
    if (!focusedElement) return;

    console.log('Current focused element:', focusedElement);
    console.log('Navigation direction:', direction);

    const navigationMap = getNavigationMap();

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
  }, [focusedElement, setFocusedElement]);

  return { navigate };
};
