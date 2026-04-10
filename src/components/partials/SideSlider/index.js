//=============================================================================
// SideSlider — Decorative left-side "info" tab
//
// Static markup right now. The CSS gives it a hover effect that pulls it
// out from the left edge. Logic-wise it does nothing, but the partial is
// kept around so the UI keeps the slot for a future info panel.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// CSS module owning the slide-in transition.
import style from './index.module.scss';

/**
 * SideSlider
 * Pure visual stub — no logic, no state.
 */
const SideSlider = () => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.slider_cont}>
      {/* Inner content placeholder — empty for now. */}
      <div className={style.slider_content}></div>
      {/* Inner tab marker. */}
      <div className={style.slider_tab_in}></div>
      {/* Outer tab with the "info" label. */}
      <div className={style.slider_tab_out}>
        <p className={style.custom_title}>info</p>
      </div>
    </div>
  );
};

export default SideSlider;
