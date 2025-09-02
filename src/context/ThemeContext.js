import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSMISSION_LEVEL,
  sections,
} from '@/constants';

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

  const toggleMusic = () => setMusicActive((prev) => !prev);

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
      e.preventDefault();

      // 1 "notch" de molette => ±1%
      const step = 1;
      const direction = Math.sign(e.deltaY); // -1 ou +1

      targetRef.current = clamp(targetRef.current + step * direction, 0, 100);
    };

    const update = () => {
      const current = proxy.value;
      const target = targetRef.current;

      // --- Smooth interpolation ---
      const smoothSpeed = 0.1;
      const newValue = current + (target - current) * smoothSpeed;

      proxy.value = newValue;
      setScrollProgress(Math.round(newValue));

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
  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length) return;

    const [min] = sections[index].range;

    // Define the target inside the section (min + 1 ensures it enters the range)
    const target = clamp(min + 1);

    // Instead of jumping directly, smoothly animate towards the target
    const step = () => {
      const current = targetRef.current;
      const diff = target - current;

      // If close enough, snap and stop
      if (Math.abs(diff) < 0.5) {
        targetRef.current = target;
        return;
      }

      // Smooth interpolation (lower factor = slower & smoother)
      targetRef.current = current + diff * 0.08;

      requestAnimationFrame(step);
    };

    step();
  };

  // Relative section progress
  function getSectionProgress(scrollProgress, range) {
    const [min, max] = range;
    return Math.min(Math.max((scrollProgress - min) / (max - min), 0), 1);
  }

  // useEffect(() => {
  //   console.log('Scroll progress:', scrollProgress.toFixed(2));
  // }, [scrollProgress]);

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the Theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};
