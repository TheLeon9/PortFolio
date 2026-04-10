//=============================================================================
// ScrollBtn — Decorative "scroll" indicator
//
// Pure visual element. No interaction — it only signals to the user that
// the scroll system is mouse/touch driven. Animation lives in the SCSS.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// CSS module — owns the circle/dot composition + the bouncing dot animation.
import style from './index.module.scss';

/**
 * ScrollBtn
 * Renders four nested elements composed by CSS into the scroll indicator.
 */
const ScrollBtn = () => {
  //-- Render -----------------------------------------------------------------
  return (
    // `aria-hidden` because it carries no semantic content for screen readers.
    <div className={style.scroll_btn_cont} aria-hidden="true">
      <div className={style.scroll_circle_left}></div>
      <div className={style.scroll_circle_right}></div>
      <div className={style.scroll_circle_dot}></div>
      <h6 className={style.scroll_down_sentence}>
        <div className={style.dot}></div>
      </h6>
    </div>
  );
};

export default ScrollBtn;
