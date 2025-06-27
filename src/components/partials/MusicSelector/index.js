'use client';
import React, { useEffect } from 'react';

import style from './index.module.scss';

import { useTheme } from '@/context/ThemeContext.js';

const MusicSelector = () => {
  const { musicActive } = useTheme();

  useEffect(() => {}, []);

  return (
    <div className={style.music_selector_cont}>
      <button className={style.music_btn}>
        <div className={style.music_line}>
          {musicActive ? <div></div> : <div></div>}

          <div className={style.hide_left}></div>
          <div className={style.hide_right}></div>
        </div>
        <div className={style.music_text_cont}>
          <p className={style.music_text}>{musicActive ? 'on' : 'off'}</p>
        </div>
      </button>
    </div>
  );
};

export default MusicSelector;
