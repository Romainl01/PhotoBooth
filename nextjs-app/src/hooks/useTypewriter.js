/**
 * useTypewriter Hook
 *
 * Implements a character-by-character text reveal animation (typewriter effect)
 * Replicates Claude Code's chat loading message behavior
 *
 * @param {string} text - The text to animate
 * @param {number} speed - Milliseconds per character (default: 70ms for readability)
 * @param {boolean} prefersReducedMotion - Accessibility: skip animation if true
 * @param {boolean} showCursor - Whether to show a blinking cursor at the end
 * @returns {string} The current revealed portion of the text (with optional cursor)
 *
 * Features:
 * - Instant reset when text changes (for message rotation)
 * - Proper Unicode/emoji handling with Array.from()
 * - Optional blinking cursor effect
 * - Respects prefers-reduced-motion accessibility setting
 * - Automatic cleanup to prevent memory leaks
 */

import { useState, useEffect } from 'react';

export default function useTypewriter(
  text,
  speed = 70,
  prefersReducedMotion = false,
  showCursor = false
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // Respect accessibility preferences - show full text immediately
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsTypingComplete(true);
      return;
    }

    // Reset and start typing from beginning
    setDisplayedText('');
    setIsTypingComplete(false);
    let currentIndex = 0;

    // Use Array.from() to properly handle Unicode characters (emojis, etc.)
    const chars = Array.from(text);

    const interval = setInterval(() => {
      currentIndex++;
      const newText = chars.slice(0, currentIndex).join('');
      setDisplayedText(newText);

      // Stop when we've typed all characters
      if (currentIndex >= chars.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, speed);

    // Cleanup: clear interval when component unmounts or text changes
    return () => clearInterval(interval);
  }, [text, speed, prefersReducedMotion]);

  // Add blinking cursor if enabled and still typing
  if (showCursor && !isTypingComplete) {
    return displayedText + '▊';
  }

  return displayedText;
}
