
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface KeyboardNavigationContextType {
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
  navigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  selectElement: () => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider');
  }
  return context;
};

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({ children }) => {
  const [focusedElement, setFocusedElement] = useState<string | null>('movie-0');

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusedElement) return;

    const [type, index] = focusedElement.split('-');
    const currentIndex = parseInt(index);

    let newFocusId = focusedElement;

    switch (direction) {
      case 'left':
        if (currentIndex > 0) {
          newFocusId = `${type}-${currentIndex - 1}`;
        }
        break;
      case 'right':
        newFocusId = `${type}-${currentIndex + 1}`;
        break;
      case 'up':
        if (currentIndex >= 6) {
          newFocusId = `${type}-${currentIndex - 6}`;
        }
        break;
      case 'down':
        newFocusId = `${type}-${currentIndex + 6}`;
        break;
    }

    const targetElement = document.getElementById(newFocusId);
    if (targetElement) {
      setFocusedElement(newFocusId);
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [focusedElement]);

  const selectElement = useCallback(() => {
    if (!focusedElement) return;
    
    const element = document.getElementById(focusedElement);
    if (element) {
      element.click();
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
        case 'Enter':
        case ' ':
          e.preventDefault();
          selectElement();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, selectElement]);

  return (
    <KeyboardNavigationContext.Provider value={{ 
      focusedElement, 
      setFocusedElement, 
      navigate, 
      selectElement 
    }}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};
