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

    // Scale up when hovering interactive elements
    const addHover = () => {
      gsap.to(cursorRef.current, {
        scale: 2,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    // Scale back to normal when leaving interactive elements
    const removeHover = () => {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    // Hide cursor when leaving the window
    const hideCursor = () => {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
      initCursor = false;
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseout', hideCursor);

    const hoverElements = document.querySelectorAll('button, a, .hover-target');
    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseout', hideCursor);
      hoverElements.forEach((el) => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);

  return <div ref={cursorRef} className={style.cursor_custom}></div>;
};

export default Cursor;
