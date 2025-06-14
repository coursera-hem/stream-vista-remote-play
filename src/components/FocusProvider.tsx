
import React, { createContext, useContext, useState } from 'react';
import { FocusContextType, FocusProviderProps } from '../types/focus';
import { useFocusNavigation } from '../hooks/useFocusNavigation';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within FocusProvider');
  }
  return context;
};

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [focusedElement, setFocusedElement] = useState<string | null>('sidebar-toggle-0');

  const { navigate } = useFocusNavigation(focusedElement, setFocusedElement);
  
  useKeyboardHandler(focusedElement, navigate);

  return (
    <FocusContext.Provider value={{ focusedElement, setFocusedElement, navigate }}>
      {children}
    </FocusContext.Provider>
  );
};
