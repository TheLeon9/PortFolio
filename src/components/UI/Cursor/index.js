import React, { useEffect, useRef } from 'react';
import style from './index.module.scss';
import gsap from 'gsap';

const Cursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    let initCursor = false;

    // Smooth cursor movement
    const moveCursor = (e) => {
      if (!initCursor) {
        gsap.to(cursorRef.current, { opacity: 0.4, duration: 0.2 });
        initCursor = true;
      }

      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      });
    };

    // Scale behaviors depending on target class
    const handleHover = (e) => {
      const cursor = cursorRef.current;

      if (e.target.closest('.hover_target_big')) {
        cursor.classList.remove(style.is_hover_small);
        cursor.classList.add(style.is_hover_big);
        gsap.to(cursor, { scale: 2, duration: 0.25, ease: 'power2.out' });
      } else if (e.target.closest('.hover_target_small')) {
        cursor.classList.remove(style.is_hover_big);
        cursor.classList.add(style.is_hover_small);
        gsap.to(cursor, { scale: 0.5, duration: 0.25, ease: 'power2.out' });
      }
    };

    const resetHover = () => {
      const cursor = cursorRef.current;
      cursor.classList.remove(style.is_hover_big, style.is_hover_small);
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
    };

    // Hide cursor when leaving the window
    const hideCursor = () => {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
      initCursor = false;
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleHover);
    document.addEventListener('mouseout', resetHover);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleHover);
      document.removeEventListener('mouseout', resetHover);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  return <div ref={cursorRef} className={style.cursor_custom}></div>;
};

export default Cursor;
