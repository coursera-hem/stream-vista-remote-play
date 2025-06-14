
import { useCallback, useEffect } from 'react';
import { NavigationDirection } from '../types/focus';

export const useKeyboardHandler = (
  focusedElement: string | null,
  navigate: (direction: NavigationDirection) => void
) => {
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
};
