import React from 'react';
import style from './index.module.scss';

import { useTheme } from '@/context/ThemeContext.js';

const MusicButton = () => {
  const { musicActive, toggleMusic } = useTheme();

  return (
    <button className={style.music_btn} onClick={toggleMusic}>
      <div className={style.music_line}>
        {[...Array(12)].map((_, idx) => (
          <span
            key={idx}
            className={`${style.bar} ${
              musicActive ? style.active : style.not_active
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          ></span>
        ))}

        <div className={style.hide_left}></div>
        <div className={style.hide_right}></div>
      </div>
      <div className={style.music_text_cont}>
        <p className={style.music_text}>{musicActive ? 'on' : 'off'}</p>
      </div>
    </button>
  );
};

export default MusicButton;
