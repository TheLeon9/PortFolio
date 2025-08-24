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
