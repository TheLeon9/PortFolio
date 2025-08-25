import React from 'react';
import style from './index.module.scss';

import { useTheme } from '@/context/ThemeContext.js';

const ScrollProgress = () => {
  const { musicActive, toggleMusic } = useTheme();

  return (
    <div className={style.scroll_progress_cont}>
      {[...Array(20)].map((_, idx) => (
        <span key={idx} className={style.progress_segment}></span>
      ))}
      <div className={style.percentage_container}>
        <p className={style.percentage_text}>100%</p>
      </div>
      {[...Array(20)].map((_, idx) => (
        <span key={idx} className={style.progress_segment}></span>
      ))}
    </div>
  );
};

export default ScrollProgress;
