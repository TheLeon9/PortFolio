import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSMISSION_LEVEL,
  sections,
} from '@/constants';

import gsap from 'gsap';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Main Color
  const [mainColor, setMainColor] = useState(DEFAULT_MAIN_COLOR);

  // Backgruond Color
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );

  // Text Color
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);

  // Transparency Level
  const [TransmissionLevel, SetTransmissionLevel] = useState(
    DEFAULT_TRANSMISSION_LEVEL
  );

  // Music
  const [musicActive, setMusicActive] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/ambiance.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicActive) {
      audioRef.current.play().catch(() => audioRef.current.pause());
    } else {
      audioRef.current.pause();
    }
  }, [musicActive]);

  const toggleMusic = useCallback(() => setMusicActive((prev) => !prev), []);

  // Message Sent
  const [messageSent, setMessageSent] = useState(false);

  //--------------------------------------------------+
  //  Smooth Scroll Management + Active Section
  //--------------------------------------------------+

  //  Active Section
  const [activeSection, setActiveSection] = useState(0);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  const proxyRef = useRef({ value: 0 });
  const targetRef = useRef(0);

  function clamp(v, a = 0, b = 100) {
    return Math.min(Math.max(v, a), b);
  }

  // Mouse scroll management
  useEffect(() => {
    const proxy = proxyRef.current;
    let animationFrameId;

    const handleWheel = (e) => {

      // Cancel the scroll
      e.preventDefault();

      // 1 "notch" of the mouse wheel => ±1%
      const step = 0.5; // Step size (percentage of scroll)
      const direction = Math.sign(e.deltaY); // -1 or +1 based on wheel direction

      // Update the target position, clamp to ensure it stays within 0 to 100
      targetRef.current = clamp(targetRef.current + step * direction, 0, 100);
    };

    const update = () => {
      const current = proxy.value;
      const target = targetRef.current;

      // --- Smooth interpolation ---
      const smoothSpeed = 0.1;
      const newValue = current + (target - current) * smoothSpeed;

      proxy.value = newValue;
      setScrollProgress(newValue);
      // setScrollProgress(Math.round(newValue));

      animationFrameId = requestAnimationFrame(update);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Active section detection
  useEffect(() => {
    let sectionIndex = sections.findIndex(
      (s) => scrollProgress >= s.range[0] && scrollProgress <= s.range[1]
    );

    if (sectionIndex === -1) {
      sectionIndex = scrollProgress <= 0 ? 0 : sections.length - 1;
    }

    if (sectionIndex !== activeSection) {
      setActiveSection(sectionIndex);
    }
  }, [scrollProgress, activeSection]);

  // Programmatic scroll (e.g., triggered from NavBar)
  const scrollToSection = useCallback((index) => {
    // Check if the index is valid
    if (index < 0 || index >= sections.length) return;

    // Extract the minimum range value of the section
    const [min] = sections[index].range;

    // Target position: just after the section's entry (ensuring it enters the range)
    const target = clamp(min + 1);

    // Stop any ongoing animation (if there is one)
    gsap.killTweensOf(targetRef);

    // Smooth scroll animation to the target position
    gsap.to(targetRef, {
      current: target,
      duration: 2, // Scroll duration
      ease: 'power3.inOut', // Smooth easing effect
    });
  }, []);

  // Relative section progress
  const getSectionProgress = useCallback((scrollProgress, range) => {
    const [min, max] = range;
    return Math.min(Math.max((scrollProgress - min) / (max - min), 0), 1);
  }, []);

  // useEffect(() => {
  //   console.log('Scroll progress:', scrollProgress.toFixed(2));
  // }, [scrollProgress]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      mainColor,
      setMainColor,
      backgroundColor,
      setBackgroundColor,
      textColor,
      setTextColor,
      TransmissionLevel,
      SetTransmissionLevel,
      musicActive,
      setMusicActive,
      toggleMusic,
      messageSent,
      setMessageSent,
      scrollProgress,
      setScrollProgress,
      activeSection,
      setActiveSection,
      scrollToSection,
      getSectionProgress,
    }),
    [
      mainColor,
      backgroundColor,
      textColor,
      TransmissionLevel,
      musicActive,
      toggleMusic,
      messageSent,
      scrollProgress,
      activeSection,
      scrollToSection,
      getSectionProgress,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the Theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};
