import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MAIN_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TRANSPARENCY_LEVEL,
} from '@/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mainColor, setMainColor] = useState(DEFAULT_MAIN_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [TransparencyLevel, SetTransparencyLevel] = useState(
    DEFAULT_TRANSPARENCY_LEVEL
  );
  const [musicActive, setMusicActive] = useState(false);

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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
