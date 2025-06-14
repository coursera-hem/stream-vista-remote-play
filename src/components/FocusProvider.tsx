
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
  const [focusedElement, setFocusedElement] = useState<string | null>('home-0-0');

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusedElement) return;

    console.log('Current focused element:', focusedElement);
    console.log('Navigation direction:', direction);

    const [section, row, col] = focusedElement.split('-');
    const rowNum = parseInt(row);
    const colNum = parseInt(col);

    let newFocusId = focusedElement;

    switch (direction) {
      case 'left':
        if (colNum > 0) {
          newFocusId = `${section}-${row}-${colNum - 1}`;
        }
        break;
      case 'right':
        newFocusId = `${section}-${row}-${colNum + 1}`;
        break;
      case 'up':
        if (section === 'home' && rowNum > 0) {
          newFocusId = `${section}-${rowNum - 1}-${col}`;
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
        // Try to find elements in the current row
        let attemptCol = 0;
        while (attemptCol < 10) { // reasonable limit
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
        while (attemptRow < 15) { // reasonable limit for number of rows
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

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    console.log('Key pressed:', e.key);
    
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
        if (focusedElement) {
          const element = document.getElementById(focusedElement);
          if (element) {
            console.log('Clicking element:', focusedElement);
            element.click();
          }
        }
        break;
    }
  }, [navigate, focusedElement]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <FocusContext.Provider value={{ focusedElement, setFocusedElement, navigate }}>
      {children}
    </FocusContext.Provider>
  );
};
