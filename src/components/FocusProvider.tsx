
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

    const targetElement = document.getElementById(newFocusId);
    if (targetElement) {
      setFocusedElement(newFocusId);
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [focusedElement]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <FocusContext.Provider value={{ focusedElement, setFocusedElement, navigate }}>
      {children}
    </FocusContext.Provider>
  );
};
