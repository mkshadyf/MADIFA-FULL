/**
 * useKeyPress Hook
 * 
 * A custom hook for detecting keyboard key presses.
 * Useful for keyboard shortcuts and accessibility features.
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Key event types
 */
export type KeyEvent = 'keydown' | 'keyup' | 'keypress';

/**
 * Key modifier options
 */
export interface KeyModifiers {
  /**
   * Whether the Alt key is required
   */
  alt?: boolean;

  /**
   * Whether the Ctrl key is required
   */
  ctrl?: boolean;

  /**
   * Whether the Shift key is required
   */
  shift?: boolean;

  /**
   * Whether the Meta key (Command on Mac) is required
   */
  meta?: boolean;
}

/**
 * Key press options
 */
export interface KeyPressOptions {
  /**
   * The event type to listen for
   */
  event?: KeyEvent;

  /**
   * Key modifiers required
   */
  modifiers?: KeyModifiers;

  /**
   * Whether the hook is active
   */
  active?: boolean;

  /**
   * Target element to attach the event listener to (defaults to document)
   */
  target?: HTMLElement | Document | Window;
}

/**
 * useKeyPress hook
 * 
 * @param targetKey - The key or array of keys to detect
 * @param handler - The callback function to run when the key is pressed
 * @param options - Additional options
 * 
 * @example
 * // Basic usage
 * useKeyPress('Escape', () => {
 *   setIsModalOpen(false);
 * });
 * 
 * // With modifiers
 * useKeyPress('s', () => {
 *   saveDocument();
 * }, { modifiers: { ctrl: true } });
 * 
 * // Multiple keys
 * useKeyPress(['ArrowUp', 'ArrowDown'], (event) => {
 *   const direction = event.key === 'ArrowUp' ? 'up' : 'down';
 *   navigateList(direction);
 * });
 */
export function useKeyPress(
  targetKey: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: KeyPressOptions = {}
): void {
  const {
    event = 'keydown',
    modifiers = {},
    active = true,
    target = document,
  } = options;

  // Create a callback that checks for modifiers
  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const keys = Array.isArray(targetKey) ? targetKey : [targetKey];

      // Check if the pressed key is one of the target keys
      if (!keys.includes(event.key)) {
        return;
      }

      // Check modifiers
      if (
        (modifiers.alt && !event.altKey) ||
        (modifiers.ctrl && !event.ctrlKey) ||
        (modifiers.shift && !event.shiftKey) ||
        (modifiers.meta && !event.metaKey)
      ) {
        return;
      }

      // Call the handler
      handler(event);
    },
    [targetKey, handler, modifiers]
  );

  // Add event listener
  useEffect(() => {
    if (!active) return;

    // Add event listener
    target.addEventListener(event, keyHandler as EventListener);

    // Clean up
    return () => {
      target.removeEventListener(event, keyHandler as EventListener);
    };
  }, [event, keyHandler, active, target]);
}

/**
 * useKeyState hook
 * 
 * A hook that tracks whether a key is currently pressed
 * 
 * @param targetKey - The key to detect
 * @param options - Additional options
 * @returns Whether the key is currently pressed
 * 
 * @example
 * const isSpacePressed = useKeyState(' ');
 * 
 * return (
 *   <div>
 *     {isSpacePressed ? 'Space is pressed!' : 'Press space...'}
 *   </div>
 * );
 */
export function useKeyState(
  targetKey: string,
  options: Omit<KeyPressOptions, 'event'> = {}
): boolean {
  const [isPressed, setIsPressed] = useState(false);
  const { modifiers = {}, active = true, target = document } = options;

  // Key down handler
  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== targetKey) {
        return;
      }

      // Check modifiers
      if (
        (modifiers.alt && !event.altKey) ||
        (modifiers.ctrl && !event.ctrlKey) ||
        (modifiers.shift && !event.shiftKey) ||
        (modifiers.meta && !event.metaKey)
      ) {
        return;
      }

      setIsPressed(true);
    },
    [targetKey, modifiers]
  );

  // Key up handler
  const keyUpHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== targetKey) {
        return;
      }

      setIsPressed(false);
    },
    [targetKey]
  );

  // Add event listeners
  useEffect(() => {
    if (!active) return;

    // Add event listeners
    target.addEventListener('keydown', keyDownHandler as EventListener);
    target.addEventListener('keyup', keyUpHandler as EventListener);

    // Clean up
    return () => {
      target.removeEventListener('keydown', keyDownHandler as EventListener);
      target.removeEventListener('keyup', keyUpHandler as EventListener);
    };
  }, [keyDownHandler, keyUpHandler, active, target]);

  return isPressed;
} 