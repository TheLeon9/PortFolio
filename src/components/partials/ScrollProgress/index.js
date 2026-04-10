//=============================================================================
// ScrollProgress — Vertical progress bar with the current scroll percentage
//
// Reads `scrollProgress` from ThemeContext and shows it between two columns
// of decorative segments. Memoised because the only thing that changes on
// every scroll tick is the integer percentage label.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// Theme context — `scrollProgress` is a number between 0 and 100.
import { useTheme } from '@/context/ThemeContext.js';

// CSS module: progress segments + label container.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// Number of decorative segments rendered above and below the percentage.
const SEGMENTS_PER_SIDE = 20;

// Pre-built top/bottom segment arrays — created once at module load instead
// of on every render so the JSX stays cheap.
const topSegments = Array.from({ length: SEGMENTS_PER_SIDE }, (_, idx) => (
  <span key={`top-${idx}`} className={style.progress_segment}></span>
));

const bottomSegments = Array.from({ length: SEGMENTS_PER_SIDE }, (_, idx) => (
  <span key={`bot-${idx}`} className={style.progress_segment}></span>
));

/**
 * ScrollProgress
 * Renders the static segments + the live percentage from ThemeContext.
 */
const ScrollProgress = () => {
  //-- State / Refs -----------------------------------------------------------
  const { scrollProgress } = useTheme();

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.scroll_progress_cont}>
      {topSegments}
      {/* Centre label rounded to the nearest integer. */}
      <div className={style.percentage_container}>
        <p className={style.percentage_text}>{Math.round(scrollProgress)}%</p>
      </div>
      {bottomSegments}
    </div>
  );
};

// Memo keeps re-renders to the strict minimum — only the percentage cell
// updates while the user scrolls.
export default React.memo(ScrollProgress);
