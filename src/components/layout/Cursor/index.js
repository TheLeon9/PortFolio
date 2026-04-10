//=============================================================================
// Cursor — Custom global cursor following the mouse (desktop only)
//
// Replaces the system pointer with a small coloured circle. The circle
// scales up on `.hover_target_big` elements and shrinks on
// `.hover_target_small` ones, giving a clean visual cue that something is
// interactive without showing the OS cursor.
//
// Touch devices have no cursor, so the component returns null on them.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// React core (state + effects).
import React, { useEffect, useState } from 'react';

// GSAP — used for the smooth movement and scale tweens.
import gsap from 'gsap';

// CSS module — class names follow the file naming convention.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// (None — all magic numbers live inside the GSAP tweens for context.)

/**
 * Cursor
 * Renders the custom cursor and wires up the document-level mouse listeners.
 *
 * @param {Object} props
 * @param {Object} props.cursorRef - React ref attached to the cursor element,
 *                                   passed by Layout so other modules (the
 *                                   animation loop) can also tween it.
 */
const Cursor = ({ cursorRef }) => {
  //-- State / Refs -----------------------------------------------------------
  // Touch detection: when true, the component renders nothing.
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  //-- Effects ----------------------------------------------------------------

  // Detect touch device once on mount. Two checks because some hybrid
  // devices report `(hover: none)` but no `ontouchstart`, or vice versa.
  useEffect(() => {
    const isTouch =
      window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    setIsTouchDevice(isTouch);
  }, []);

  // Wire up the four document listeners on desktop.
  useEffect(() => {
    if (isTouchDevice) return;

    // Tracks whether the cursor has been faded in yet (first mousemove).
    let initCursor = false;

    //-- Handlers -------------------------------------------------------------

    /**
     * moveCursor
     * Smoothly tween the cursor to the new mouse position. The first call
     * also fades the cursor in (opacity 0 → 0.4) so it doesn't appear at
     * (0,0) before the user actually moves.
     */
    const moveCursor = (e) => {
      if (!initCursor) {
        gsap.to(cursorRef.current, { opacity: 0.4, duration: 0.2 });
        initCursor = true;
      }

      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,    // slight delay = "weighted" follow
        ease: 'power2.out',
      });
    };

    /**
     * handleHover
     * On every mouseover, look up at the closest ancestor with a hover
     * class and apply the matching scale + CSS class.
     */
    const handleHover = (e) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      if (e.target.closest('.hover_target_big')) {
        // Big hover state — used by primary buttons & project rings.
        cursor.classList.remove(style.is_hover_small);
        cursor.classList.add(style.is_hover_big);
        gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out' });
      } else if (e.target.closest('.hover_target_small')) {
        // Small hover state — used by inputs & secondary buttons.
        cursor.classList.remove(style.is_hover_big);
        cursor.classList.add(style.is_hover_small);
        gsap.to(cursor, { scale: 0.5, duration: 0.25, ease: 'power2.out' });
      }
    };

    /**
     * resetHover
     * On mouseout, drop the hover classes and animate back to scale 1.
     */
    const resetHover = () => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.classList.remove(style.is_hover_big, style.is_hover_small);
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
    };

    /**
     * hideCursor
     * When the mouse leaves the document, fade the cursor out and reset
     * the `initCursor` flag so the next entry triggers the fade-in again.
     */
    const hideCursor = () => {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
      initCursor = false;
    };

    // Attach the four listeners to the document.
    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleHover);
    document.addEventListener('mouseout', resetHover);
    document.addEventListener('mouseleave', hideCursor);

    // Detach on cleanup so we don't leak listeners between mounts.
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleHover);
      document.removeEventListener('mouseout', resetHover);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, [isTouchDevice]);

  //-- Render -----------------------------------------------------------------
  // No cursor on touch — return null so React doesn't even render the div.
  if (isTouchDevice) return null;
  return <div ref={cursorRef} className={style.cursor_custom}></div>;
};

export default Cursor;
