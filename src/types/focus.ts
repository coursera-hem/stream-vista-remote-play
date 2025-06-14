
export interface FocusContextType {
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
  navigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export interface FocusProviderProps {
  children: React.ReactNode;
}

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export type NavigationMap = Record<string, Record<string, string[]>>;
