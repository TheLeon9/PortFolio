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
  DEFAULT_TRANSPARENCY_LEVEL,
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
  const [TransparencyLevel, SetTransparencyLevel] = useState(
    DEFAULT_TRANSPARENCY_LEVEL
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

  return (
    <ThemeContext.Provider
      value={{
        mainColor,
        setMainColor,
        backgroundColor,
        setBackgroundColor,
        textColor,
        setTextColor,
        TransparencyLevel,
        SetTransparencyLevel,
        musicActive,
        setMusicActive,
        toggleMusic,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
