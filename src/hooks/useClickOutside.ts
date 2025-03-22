/**
 * useClickOutside Hook
 * 
 * A custom hook for detecting clicks outside of a specified element.
 * Useful for closing dropdowns, modals, and other interactive elements.
 */

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

/**
 * useClickOutside hook
 * 
 * @param handler - The callback function to run when a click outside is detected
 * @param active - Whether the hook is active (default: true)
 * @returns A ref to attach to the element
 * 
 * @example
 * const MyDropdown = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   // Close dropdown when clicking outside
 *   const dropdownRef = useClickOutside(() => {
 *     if (isOpen) setIsOpen(false);
 *   });
 *   
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * };
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  active = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      // Do nothing if the ref is not set or if the click is inside the element
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler, active]);

  return ref;
}

/**
 * useClickOutside hook with multiple refs
 * 
 * @param handler - The callback function to run when a click outside is detected
 * @param refs - Array of refs to check
 * @param active - Whether the hook is active (default: true)
 * 
 * @example
 * const MyComponent = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const triggerRef = useRef(null);
 *   const contentRef = useRef(null);
 *   
 *   // Close when clicking outside both the trigger and content
 *   useMultiClickOutside(
 *     () => {
 *       if (isOpen) setIsOpen(false);
 *     },
 *     [triggerRef, contentRef]
 *   );
 *   
 *   return (
 *     <>
 *       <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && <div ref={contentRef}>Content</div>}
 *     </>
 *   );
 * };
 */
export function useMultiClickOutside(
  handler: () => void,
  refs: Array<RefObject<HTMLElement>>,
  active = true
): void {
  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      // Check if the click is inside any of the refs
      const isInside = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node)
      );

      if (!isInside) {
        handler();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler, refs, active]);
} 